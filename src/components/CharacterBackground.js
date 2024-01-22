import React, { useState, useMemo } from "react";
import { Typography, Button } from "@mui/material";
import CharacterTypography from "./CharacterTypography";
import { useTheme } from "@emotion/react";
import "./Character.css";

const MAX_LENGTH = 500;

const CharacterBackground = ({ background }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const { content, title } = background || {};

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

  if (!background || !background.content) {
    return null;
  }

  const toggleIsExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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
