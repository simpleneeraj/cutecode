const CODE_LINES = [
  { w: "60%", o: 1 },
  { w: "80%", o: 0.7 },
  { w: "45%", o: 0.5 },
  { w: "70%", o: 0.8 },
  { w: "35%", o: 0.4 },
  { w: "55%", o: 0.6 },
];

function SnippetThumbnail() {
  return (
    <div className="relative overflow-hidden h-36 w-full">
      <div className="absolute inset-x-4 top-4 bottom-3 rounded-xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-sm flex flex-col">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/8 bg-black/30 shrink-0">
          <div className="size-2 rounded-full bg-primary/50" />
          <div className="size-2 rounded-full bg-primary/50" />
          <div className="size-2 rounded-full bg-primary/50" />
          <div className="flex-1" />
          <div className="h-1.5 w-12 rounded-full bg-white/10" />
        </div>
        <div className="flex flex-col gap-1.5 px-3 py-2.5 flex-1">
          {CODE_LINES.map((line, i) => (
            <div key={i} className="h-1.5 rounded-full bg-white/25" style={{ width: line.w, opacity: line.o }} />
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
    </div>
  );
}

export default SnippetThumbnail;
