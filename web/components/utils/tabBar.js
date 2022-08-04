import { Typography } from '@mui/material';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';

export default function TabBar(props) {
  const { tabs, tab } = props;
  const { addQueryParam, removeQueryParam } = UseAdvancedRouter();

  const handleClick = (index) => {
    addQueryParam({ tab: index });
  };

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
            onClick={() => handleClick(index)}
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
