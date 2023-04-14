import { Typography, Badge } from '@mui/material';

type ValidTabFormat =
  | {
      title?: string;
      index?: number;
      badge?: number;
    }
  | string;

type TabBarProps = {
  tabs: ValidTabFormat[];
  tab: number;
  handleClick: (newIndex: number) => void;
  parent: string;
};

export default function TabBar(props: TabBarProps) {
  const { tabs, tab, handleClick, parent } = props;

  return (
    <div className="flex flex-row justify-start items-center w-full overflow-x-auto">
      {tabs.map((tb, i) => {
        const title = typeof tb == 'string' ? tb : tb.title;
        const index = typeof tb == 'string' ? i : tb.index;
        const badge = typeof tb == 'string' ? undefined : tb.badge;

        return (
          <button
            key={`tab-item-${parent}-${title}-${index}`}
            className="py-4 mr-3 sm:mr-6"
            onClick={() => handleClick(index)}
          >
            {badge && badge > 0 ? (
              <Badge
                className="pr-2 text-white opacity-100"
                color="error"
                badgeContent={badge}
                max={99}
              >
                <div
                  className={
                    tab == index
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
                  tab == index
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
