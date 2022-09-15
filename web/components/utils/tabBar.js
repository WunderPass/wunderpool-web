import { Typography, Badge } from '@mui/material';
import { useEffect, useState } from 'react';

export default function TabBar(props) {
  const { tabs, tab, setTab, parent, proposals } = props;
  const [currentVotingsCount, setCurrentVotingsCount] = useState(0);

  const handleClick = (index) => {
    setTab(index);
  };

  useEffect(() => {
    proposals &&
      setCurrentVotingsCount(
        proposals.filter((p) => !(p.executed || p.declined || p.executable))
          .length
      );
  }, [proposals]);

  return (
    <div className="flex flex-row justify-start items-center w-full overflow-x-auto">
      {tabs.map((tb, i) => {
        const title = tb?.title || tb;
        const index = tb?.index || i;
        return (
            <button
              key={`tab-item-${parent}-${title}-${index}`}
              className="py-4 mr-3 sm:mr-6"
              onClick={() => handleClick(index)}
            >
              {title == 'Votings' ? (
                <Badge
                  className="pr-2 text-white opacity-100"
                  color="red"
                  badgeContent={currentVotingsCount}
                  max={99}
                >
                  <div
                    className={
                      tab == i
                        ? 'flex flex-row items-center justify-center'
                        : 'flex flex-row items-center justify-center opacity-40'
                    }
                  >
                    <Typography className="text-black">{title}</Typography>
                  </div>
                </Badge>
              ) : (
                <div
                  className={
                    tab == i
                      ? 'flex flex-row items-center justify-center'
                      : 'flex flex-row items-center justify-center opacity-40'
                  }
                >
                  <Typography className="text-black">{title}</Typography>
                </div>
              </Badge>
            ) : (
              <div
                className={
                  tab == i
                    ? 'flex flex-row items-center justify-center'
                    : 'flex flex-row items-center justify-center opacity-40'
                }
              >
                <Typography>{title}</Typography>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
