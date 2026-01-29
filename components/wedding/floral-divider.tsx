export function FloralDivider({ className }: { className?: string }) {
  return (
    <div className={`divider ${className ?? ""}`.trim()} aria-hidden>
      <img src="/florals/divider-branch.svg" alt="" />
    </div>
  );
}
