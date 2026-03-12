"use client";

import { useState } from "react";

export default function ScripturePanel(){

  const verses = [
    "John 3:16",
    "Psalm 23:1",
    "Romans 8:28"
  ];

  const [verse] = useState(
    () => verses[Math.floor(Math.random()*verses.length)]
  );

  return (
    <div>{verse}</div>
  );
}