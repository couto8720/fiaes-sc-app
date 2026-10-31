// Marcadores cinzentos enquanto os dados chegam (fazem parte do HTML estático da página).
export function Esqueleto({ cartoes = 3 }: { cartoes?: number }) {
  return (
    <div aria-busy="true" aria-label="A carregar" className="animate-pulse space-y-3">
      <div className="mb-4 flex gap-2">
        {[64, 72, 72, 72].map((w, i) => (
          <div key={i} className="h-9 rounded-full bg-borda" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: cartoes }, (_, i) => (
        <div key={i} className="h-32 rounded-xl bg-borda/70" />
      ))}
    </div>
  );
}

export function Titulo({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-4 text-2xl font-black tracking-tight">{children}</h1>;
}
