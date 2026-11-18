import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { LocaleProvider } from '../../../i18n';
import WrittenInNotice from './WrittenInNotice';

describe('WrittenInNotice', () => {
  it('says the AI wrote the text in French', () => {
    render(<WrittenInNotice language="fr" by="ai" />);
    expect(screen.getByText('Written by AI in French')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Translate with AI' }),
    ).not.toBeInTheDocument();
  });

  it('says legacy text is in English, in French', () => {
    render(
      <LocaleProvider initial="fr">
        <WrittenInNotice language="en" by="legacy" />
      </LocaleProvider>,
    );
    expect(screen.getByText('Écrit en anglais')).toBeInTheDocument();
  });

  it('offers the translation when possible', () => {
    const onTranslate = vi.fn();
    render(<WrittenInNotice language="fr" by="ai" onTranslate={onTranslate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Translate with AI' }));
    expect(onTranslate).toHaveBeenCalled();
  });
});
