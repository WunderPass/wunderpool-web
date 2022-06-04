export function tailwindBgColor(color) {
  switch (color) {
    case 'slate':
      return 'bg-slate-300';
    case 'gray':
      return 'bg-gray-300';
    case 'zinc':
      return 'bg-zinc-300';
    case 'neutral':
      return 'bg-neutral-300';
    case 'stone':
      return 'bg-stone-300';
    case 'red':
      return 'bg-red-300';
    case 'orange':
      return 'bg-orange-300';
    case 'amber':
      return 'bg-amber-300';
    case 'yellow':
      return 'bg-yellow-300';
    case 'lime':
      return 'bg-lime-300';
    case 'green':
      return 'bg-green-300';
    case 'emerald':
      return 'bg-emerald-300';
    case 'teal':
      return 'bg-teal-300';
    case 'cyan':
      return 'bg-cyan-300';
    case 'sky':
      return 'bg-sky-300';
    case 'blue':
      return 'bg-blue-300';
    case 'indigo':
      return 'bg-indigo-300';
    case 'violet':
      return 'bg-violet-300';
    case 'purple':
      return 'bg-purple-300';
    case 'fuchsia':
      return 'bg-fuchsia-300';
    case 'pink':
      return 'bg-pink-300';
    case 'rose':
      return 'bg-rose-300';
    default:
      return 'bg-blue-300';
  }
}

export function getRandomBgColor() {
  return [
    'bg-slate-300',
    'bg-gray-300',
    'bg-zinc-300',
    'bg-neutral-300',
    'bg-stone-300',
    'bg-red-300',
    'bg-orange-300',
    'bg-amber-300',
    'bg-yellow-300',
    'bg-lime-300',
    'bg-green-300',
    'bg-emerald-300',
    'bg-teal-300',
    'bg-cyan-300',
    'bg-sky-300',
    'bg-blue-300',
    'bg-indigo-300',
    'bg-violet-300',
    'bg-purple-300',
    'bg-fuchsia-300',
    'bg-pink-300',
    'bg-rose-300',
  ][Math.round(Math.random() * 21)];
}
