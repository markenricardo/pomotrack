import React from "react";
import "../index.css";
import "./Pageheader.css";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="page-header">
      <h2 className="page-header_title">{title}</h2>
      <p className="page-header_subtitle">{subtitle}</p>
    </header>
  );
}

export default PageHeader;