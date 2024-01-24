import React, { useState, useMemo, useContext } from "react";
import { Typography, Button } from "@mui/material";
import CharacterTypography from "./CharacterTypography";
import { useTheme } from "@emotion/react";
import "./Character.css";
import { CharacterContext } from "../contexts/CharacterContext";

const MAX_LENGTH = 500;

const CharacterBackground = () => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    character: {
      background,
      background: { content, title },
    },
  } = useContext(CharacterContext);

  const processedContent = useMemo(() => {
    if (!content) {
      return null;
    }
    let charactersLeft = MAX_LENGTH;
    return content.map((paragraph) => {
      if (isExpanded) {
        return paragraph;
      }
      if (charactersLeft <= 0) {
        return null;
      }
      if (paragraph.length <= charactersLeft) {
        charactersLeft -= paragraph.length;
        return paragraph;
      }
      const truncated = `${paragraph.substring(0, charactersLeft)}... `;
      charactersLeft = 0;
      return truncated;
    });
  }, [content, isExpanded]);

  const toggleIsExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!background) {
    return;
  }

  return (
    <>
      <CharacterTypography>
        <strong>History:</strong>
      </CharacterTypography>
      <Typography variant="h5" className="background-title">
        {title}
      </Typography>
      {processedContent.map((paragraph, index) => (
        <div key={index} style={{ padding: "5px" }}>
          <CharacterTypography>{paragraph}</CharacterTypography>
        </div>
      ))}
      <Button
        onClick={toggleIsExpanded}
        variant="text"
        size="small"
        style={{
          color: theme.palette.text.primary,
          fontSize: theme.typography.body1.fontSize,
          fontFamily: theme.typography.fontFamily,
          textTransform: "none",
        }}
      >
        {isExpanded ? "Show Less" : "Show More..."}
      </Button>
    </>
  );
};

export default CharacterBackground;
