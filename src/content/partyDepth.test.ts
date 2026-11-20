import { CharacterClasses } from '../types/character';
import type { Party } from '../types/party';
import { ROLES } from './data';
import { generateParty, rerollMember } from './party';
import {
  balanceOf,
  completeParty,
  gaps,
  MAX_SAME_ROLE,
  MAX_TIES_PER_MEMBER,
  removeTie,
  renderHook as hookText,
  renderTie as tieText,
  rerollHook,
  rerollTie,
  roleLabel,
  setRole,
} from './partyDepth';

const parties = (count: number, size = 4) =>
  Array.from({ length: count }, () => generateParty({ size }));

describe('ties', () => {
  it('are sometimes absent and never too many (SC-001)', () => {
    const all = parties(1000);
    const without = all.filter((p) => p.ties!.length === 0).length / 1000;
    expect(without).toBeGreaterThanOrEqual(0.15);
    expect(without).toBeLessThanOrEqual(0.4);
    for (const party of all) {
      for (const member of party.members) {
        const count = party.ties!.filter(
          (t) => t.from === member.id || t.to === member.id,
        ).length;
        expect(count).toBeLessThanOrEqual(MAX_TIES_PER_MEMBER);
      }
      const pairs = party.ties!.map((t) => [t.from, t.to].sort().join());
      expect(new Set(pairs).size).toBe(pairs.length);
      for (const tie of party.ties!) expect(tie.from).not.toBe(tie.to);
    }
  });

  it('name both members in both languages', () => {
    const party = parties(50).find((p) => p.ties!.length > 0)!;
    const tie = party.ties![0];
    const name = (id: string) =>
      party.members.find((m) => m.id === id)!.character.firstName;
    for (const locale of ['en', 'fr'] as const) {
      const text = tieText(tie, party, locale);
      expect(text).toContain(name(tie.from));
      expect(text).toContain(name(tie.to));
      expect(text).not.toMatch(/[{}]/);
    }
  });

  it('can be rerolled or removed one at a time', () => {
    const party = parties(50).find((p) => p.ties!.length > 0)!;
    const [first] = party.ties!;
    const rerolled = rerollTie(party, first.id);
    expect(rerolled.ties![0].type).not.toBe(first.type);
    expect(rerolled.ties!.slice(1)).toEqual(party.ties!.slice(1));
    expect(removeTie(party, first.id).ties).toEqual(party.ties!.slice(1));
  });

  it('keep ties between two kept members, and drop a replaced member’s ties', () => {
    const party = parties(100).find((p) => p.ties!.length > 0)!;
    const tie = party.ties![0];
    const keep = party.members.map((m) =>
      m.id === tie.from || m.id === tie.to ? { ...m, locked: true } : m,
    );
    const next = generateParty({ size: 4, keep, keepTies: party.ties });
    expect(next.ties).toContainEqual(tie);
    const replaced = rerollMember(party, tie.from);
    expect(
      replaced.ties!.some((t) => t.from === tie.from || t.to === tie.from),
    ).toBe(false);
  });
});

describe('roles', () => {
  it('follow the party rules over 1,000 parties (SC-002)', () => {
    const rolesByClass = new Map<string, Set<string>>();
    for (const party of parties(1000)) {
      const roles = party.members.map((m) => m.role!);
      expect(roles.every(Boolean)).toBe(true);
      for (const role of ROLES) {
        const count = roles.filter((r) => r === role.id).length;
        expect(count).toBeLessThanOrEqual(role.unique ? 1 : MAX_SAME_ROLE);
      }
      for (const { character, role } of party.members) {
        const set = rolesByClass.get(character.characterClass) ?? new Set();
        set.add(role!);
        rolesByClass.set(character.characterClass, set);
      }
    }
    for (const cls of Object.values(CharacterClasses)) {
      expect(rolesByClass.get(cls)!.size).toBeGreaterThanOrEqual(3);
    }
  });

  it('can be chosen, drawn again, and stay with kept members', () => {
    const party = generateParty({ size: 4 });
    const [first, second] = party.members;
    const chosen = setRole(party, first.id, 'role-scholar');
    expect(chosen.members[0].role).toBe('role-scholar');
    const random = setRole(chosen, first.id, 'random');
    expect(random.members[0].role).not.toBe('role-scholar');
    const kept = random.members.map((m, i) =>
      i === 0 ? { ...m, locked: true } : m,
    );
    expect(generateParty({ size: 4, keep: kept }).members[0].role).toBe(
      random.members[0].role,
    );
    // Choosing the leader by hand takes it from the current leader.
    const withLeader = setRole(
      setRole(party, second.id, 'role-leader'),
      first.id,
      'role-leader',
    );
    expect(
      withLeader.members.filter((m) => m.role === 'role-leader'),
    ).toHaveLength(1);
    expect(withLeader.members[0].role).toBe('role-leader');
  });

  it('agree with the gender in French', () => {
    expect(roleLabel('role-scout', 'Female', 'fr')).toBe('Éclaireuse');
    expect(roleLabel('role-scout', 'Non-binary', 'fr')).toBe('Éclaireur');
    expect(roleLabel('role-scout', 'Female', 'en')).toBe('Scout');
  });
});

describe('balance', () => {
  const member = (characterClass: string, role: string) =>
    ({
      character: { characterClass },
      role,
    }) as unknown as Party['members'][number];

  it('derives levels from classes and roles, and names the gaps', () => {
    const party = {
      members: [
        member('Warrior', 'role-muscle'),
        member('Warrior', 'role-guardian'),
        member('Mage', 'role-scholar'),
      ],
    };
    expect(balanceOf(party)).toEqual({
      fighting: 3,
      magic: 2,
      healing: 0,
      stealth: 0,
      talking: 0,
    });
    expect(gaps(party)).toEqual(['healing', 'stealth', 'talking']);
  });

  it('has no gap for a well-rounded party', () => {
    const party = {
      members: [
        member('Warrior', 'role-leader'),
        member('Mage', 'role-strategist'),
        member('Rogue', 'role-scout'),
        member('Cleric', 'role-healer'),
      ],
    };
    expect(gaps(party)).toEqual([]);
  });
});

describe('adventure hook', () => {
  it.each(['en', 'fr'] as const)(
    'gives at least 20 distinct hooks in 100 draws in %s (SC-003)',
    (locale) => {
      const party = generateParty({ size: 3 });
      const hooks = new Set(
        Array.from({ length: 100 }, () => hookText(rerollHook(party), locale)),
      );
      expect(hooks.size).toBeGreaterThanOrEqual(20);
      for (const hook of hooks) expect(hook).toMatch(/^[A-ZÀ-Ý].*\.$/);
    },
  );

  it('rerolls on its own and drops an AI-written hook', () => {
    const party: Party = {
      ...generateParty({ size: 2 }),
      text: {
        name: 'N',
        story: ['S'],
        hook: 'AI hook.',
        language: 'en',
        source: 'ai',
      },
    };
    expect(hookText(party, 'en')).toBe('AI hook.');
    const next = rerollHook(party);
    expect(next.hook).not.toEqual(party.hook);
    expect(next.text?.hook).toBeUndefined();
    expect(next.members).toBe(party.members);
  });
});

describe('completeParty', () => {
  it('gives roles, a hook and no ties to an older party', () => {
    const old = generateParty({ size: 3 });
    const legacy: Party = {
      ...old,
      members: old.members.map((m) => {
        const copy = { ...m };
        delete copy.role;
        return copy;
      }),
    };
    delete legacy.ties;
    delete legacy.hook;
    const done = completeParty(legacy);
    expect(done.members.every((m) => m.role)).toBe(true);
    expect(done.ties).toEqual([]);
    expect(done.hook).toBeDefined();
  });
});
