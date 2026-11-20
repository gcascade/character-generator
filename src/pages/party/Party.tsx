import { Box, Card, CardContent, Typography } from '@mui/material';
import React, { FC, useContext } from 'react';
import AdventureHook from '../../components/party/adventureHook/AdventureHook';
import PartyBalance from '../../components/party/partyBalance/PartyBalance';
import PartyTies from '../../components/party/partyTies/PartyTies';
import RoleMenu from '../../components/party/roleMenu/RoleMenu';
import PageTitle from '../../components/common/pageTitle/PageTitle';
import PartyControls from '../../components/party/partyControls/PartyControls';
import PartyMemberCard from '../../components/party/partyMemberCard/PartyMemberCard';
import PartyStory from '../../components/party/partyStory/PartyStory';
import { matchesConstraints, renderParty } from '../../content/party';
import { shareUrl } from '../../content/share';
import ShareButton from '../../components/common/share/ShareButton';
import { DataContext } from '../../contexts/DataContext';
import useAlert from '../../hooks/useAlert';
import useParty from '../../hooks/useParty';
import usePartyGenerator from '../../hooks/usePartyGenerator';
import { useLocale, useT } from '../../i18n';

/** The party generator page (spec 004). */
const Party: FC = () => {
  const t = useT();
  const { locale } = useLocale();
  const data = useContext(DataContext);
  const { addSuccess } = useAlert();
  const {
    party,
    constraints,
    saveParty,
    rerollMember,
    toggleLock,
    rerollTie,
    removeTie,
    setRole,
    rerollHook,
  } = useParty();
  const { generateParty, writing } = usePartyGenerator();

  if (!data) throw new Error('Party must be used within a DataProvider');

  const onGenerate = () => {
    void generateParty();
  };

  const onSave = () => {
    saveParty();
    addSuccess(t('party.savedAlert'));
  };

  return (
    <Box sx={{ padding: { xs: 0.5, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <PageTitle>{t('page.party')}</PageTitle>
      <PartyControls
        onGenerate={onGenerate}
        onSave={onSave}
        generating={writing}
      />
      {party ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
          <PartyStory party={party} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            <Card>
              <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
                <PartyTies
                  party={party}
                  onReroll={rerollTie}
                  onRemove={removeTie}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
                <PartyBalance party={party} />
              </CardContent>
            </Card>
          </Box>
          <AdventureHook party={party} onReroll={rerollHook} />
          <Box sx={{ mt: -1.5 }}>
            <ShareButton
              label={t('share.party')}
              target={() => ({
                title: renderParty(party, locale).name,
                url: shareUrl({ kind: 'party', party }),
                copied: 'share.partyCopied',
              })}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            {party.members.map((member) => (
              <PartyMemberCard
                key={member.id}
                member={member}
                onToggleLock={() => toggleLock(member.id)}
                onReroll={() => rerollMember(member.id)}
                shareable
                roleControl={
                  <RoleMenu
                    role={member.role}
                    gender={member.character.gender}
                    name={member.character.firstName}
                    onChange={(role) => setRole(member.id, role)}
                  />
                }
                onSave={() => {
                  data.saveCharacter(member.character);
                  addSuccess(
                    t('party.memberSavedAlert', {
                      name: member.character.firstName,
                    }),
                  );
                }}
                notMatching={
                  member.locked &&
                  !matchesConstraints(member.character, constraints)
                }
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Typography
          sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}
        >
          {t('party.empty')}
        </Typography>
      )}
    </Box>
  );
};

export default Party;
