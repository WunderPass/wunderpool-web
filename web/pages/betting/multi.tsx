import { Container, Skeleton, Typography } from '@mui/material';
import MultiList from '../../components/betting/multi/list';
import CustomHeader from '../../components/general/utils/customHeader';
import { UseBettingService } from '../../hooks/useBettingService';
import { UseUserType } from '../../hooks/useUser';
import { UseNotification } from '../../hooks/useNotification';

type MultiBettingPageProps = {
  bettingService: UseBettingService;
  user: UseUserType;
  handleError: UseNotification.handleError;
};

export default function MultiBettingPage(props: MultiBettingPageProps) {
  const { bettingService } = props;

  return (
    <>
      <CustomHeader />
      <div className="flex sm:flex-row flex-col font-graphik h-full">
        <Container>
          <div className="flex flex-row w-full justify-start ">
            <div className="flex flex-col w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-10">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center ">
                    <Typography className=" text-2xl mt-5 sm:text-4xl mb-2 font-medium">
                      Combo Games
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="sm:flex sm:flex-row">
                <div className="w-full pr-1 mb-8 mt-8 sm:mb-0 sm:mt-0 ">
                  <div className="flex flex-row items-center justify-between mb-3 h-14 w-full">
                    {/* <div className="flex gap-2">
                      <DropDown
                        list={[
                          'All Events',
                          ...bettingService.events.map(
                            (event) => event.competitionName
                          ),
                        ]}
                        value={eventTypeSort}
                        setValue={(item) => pickFilter(item)}
                      />
                    </div> */}
                  </div>

                  {bettingService.isReady ? (
                    <MultiList {...props} />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      sx={{ height: '100px', borderRadius: 3 }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
