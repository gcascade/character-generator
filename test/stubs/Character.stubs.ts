import { Character, CharacterBackground } from 'src/types/character';

export const longBackgroundStub: CharacterBackground = {
  title: 'Outcast of the Deep Delve',
  content: [
    "Eira was born deep within the dwarven stronghold of Kragnir's Spire. From a young age, she demonstrated a natural talent for thievery and stealth, often sneaking into the mines to pilfer precious gems and metals. Her parents, both respected members of the dwarven community, were ashamed of her ways and sought to correct her through discipline and hard labor.",
    "As she grew older, Eira's love for pilfering only intensified. She began to take greater risks, often venturing into areas forbidden to her kind. This reckless abandon eventually led to her being cast out of the stronghold by the dwarven council.",
    "Eira found solace in the dark tunnels and hidden passages that crisscrossed the underground realm. She honed her skills as a thief, using her cunning and agility to survive. Her reputation grew, and she became known as 'The Whispering Blade', feared and respected in equal measure.",
    'Her latest score was the fabled Starheart crystal, said to grant its wielder immense magical power. Eira intends to use this prize to further her own interests, perhaps even forming an alliance with a powerful organization or individual.',
  ],
};

export const shortBackgroundStub: CharacterBackground = {
  title: 'Outcast of the Deep Delve',
  content: [
    "Eira was born deep within the dwarven stronghold of Kragnir's Spire.",
  ],
};

export const korvusBlackiron: Character = {
  firstName: 'Korvus',
  lastName: 'Blackiron',
  epithet: 'The Unyielding',
  race: 'Orc',
  characterClass: 'Warrior',
  gender: 'Male',
  age: 48,
  alignment: 'Lawful Good',
  background: {
    title: 'Veteran of the Battlefields',
    content: [
      "The scars on his armor tell the story of Korvus' many battles fought and won. As a veteran of the wars against the dark forces, he has earned the respect and admiration of his comrades.",
      'After years of campaigning, Korvus has seen his share of bloodshed and devastation. Yet, he remains steadfast in his conviction that honor and justice are worth fighting for.',
      'In his downtime, Korvus enjoys reminiscing about old battles with fellow veterans over a mug of ale.',
      'His unwavering loyalty to his comrades and cause is the foundation of his unshakeable resolve.',
      'When not on the battlefield, Korvus can be found practicing his swordsmanship or studying ancient texts on warfare.',
    ],
  },
};

export const eryndorThorne: Character = {
  firstName: 'Eryndor',
  lastName: 'Thorne',
  epithet: 'The Unyielding',
  race: 'Human',
  characterClass: 'Warrior',
  gender: 'Male',
  age: 53,
  alignment: 'Lawful Good',
  background: {
    title: 'Soldier of the Realm',
    content: [
      'The thrill of battle still coursing through his veins, Eryndor Thorne left the army after a lifetime of service. He fought in wars that shaped the realm and earned a reputation as a fierce and loyal warrior.',
      'After retiring from active duty, Eryndor settled down in a small town where he could watch over the innocent and protect the weak.',
      'Despite his age, Eryndor still trains regularly to keep his skills sharp. He knows that the threat of darkness is always present and that he must remain vigilant.',
      "Eryndor's greatest regret is not being able to save more lives during his time in service. This drives him to be an even greater force for good now that he's retired.",
      'Though he may seem gruff and unforgiving at times, Eryndor has a heart of gold and will stop at nothing to defend those who cannot defend themselves.',
      "Eryndor's ultimate goal is to create a world where his children and grandchildren can live in peace, free from the horrors that he witnessed on the battlefield.",
    ],
  },
};

export const eiraKragnir: Character = {
  firstName: 'Eira',
  lastName: 'Kragnir',
  epithet: 'The Frost Mage',
  race: 'Dwarf',
  characterClass: 'Mage',
  gender: 'Female',
  age: 268,
  alignment: 'Neutral Evil',
  background: shortBackgroundStub,
};
