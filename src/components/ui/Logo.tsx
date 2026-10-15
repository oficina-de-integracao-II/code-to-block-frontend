import logoSimbolo from '../../assets/logo/simbolo.svg';

export function Logo() {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5">
      <img src={logoSimbolo} alt="" className="h-[93px] w-[143px]" />
      <p className="font-heading text-[33px] font-bold text-ink">Code to Blocks</p>
    </div>
  );
}
