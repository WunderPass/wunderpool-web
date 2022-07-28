import { Typography } from '@mui/material';

export default function TabBar(props) {
  const { tabs, tab, setTab } = props;

  return (
    <div className="flex flex-row justify-start items-center w-full overflow-x-auto">
      {tabs.map((tb, i) => {
        const title = tb?.title || tb;
        const index = tb?.index || i;
        return (
          <button
            key={`tab-item-${title}-${index}`}
            className={
              tab == i ? 'py-4 pr-3 sm:pr-6' : 'py-4 pr-3 sm:pr-6 opacity-40'
            }
            onClick={() => setTab(index)}
          >
            <div className="flex flex-row items-center justify-center">
              <Typography>{title}</Typography>
            </div>
          </button>
        );
      })}
    </div>
  );
}
