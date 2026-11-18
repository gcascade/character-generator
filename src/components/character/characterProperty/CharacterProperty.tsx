import React, { FC } from 'react';
import RerollButton from '../../common/buttons/RerollButton';
import CharacterTypography from '../characterTypography/CharacterTypography';
import { useT } from '../../../i18n';

type CharacterPropertyProps = {
  label: string;
  value: string | number;
  /** Tooltip of the reroll button, e.g. "Reroll the first name". */
  tooltip: string;
  onButtonClick: VoidFunction;
  isRerollButtonDisabled?: boolean;
};

const CharacterProperty: FC<CharacterPropertyProps> = ({
  label,
  value,
  tooltip,
  onButtonClick,
  isRerollButtonDisabled,
}) => {
  const t = useT();
  return (
    <CharacterTypography>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <strong style={{ marginRight: '5px', whiteSpace: 'nowrap' }}>
          {label}
          {t('punct.colon')}
        </strong>
        <span>{value}</span>
        <RerollButton
          tooltip={tooltip}
          onButtonClick={onButtonClick}
          disabled={!!isRerollButtonDisabled}
        />
      </span>
    </CharacterTypography>
  );
};

export default CharacterProperty;
