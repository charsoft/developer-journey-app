/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Image from 'next/image'
import { RootState } from '../redux/store'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { GridPosition } from 'src/models/GridPosition';
import { collectItem, moveDown, moveLeft, moveRight, moveUp, setIsSavingMission, startMission } from 'src/redux/gameSlice';
import { useAddCompletedMissionMutation, useGetUserQuery } from 'src/redux/apiSlice'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'


export default function Component({ x, y }: GridPosition) {
  const {
    data: user,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetUserQuery();

  const [addCompletedMission] = useAddCompletedMissionMutation()

  const dispatch = useAppDispatch()

  const { playerPosition, mission, inventory, allItemsCollected, isSavingMission } = useAppSelector((state: RootState) => state.game)
  const playerIsOnTile = playerPosition.x === x && playerPosition.y === y;
  const playerIsOnStartingTile = playerPosition.x === 0 && playerPosition.y === 0;
  const playerIsLeftOfTile = playerPosition.x + 1 === x && playerPosition.y === y;
  const playerIsRightOfTile = playerPosition.x - 1 === x && playerPosition.y === y;
  const playerIsAboveTile = playerPosition.x === x && playerPosition.y - 1 === y;
  const playerIsBelowTile = playerPosition.x === x && playerPosition.y + 1 === y;
  const playerIsOnAdjacentTile = playerIsLeftOfTile || playerIsRightOfTile || playerIsAboveTile || playerIsBelowTile;
  const tileIsFinalTile = x == 2 && y == 2;

  const tileItem = inventory.find(item => item.position.x === x && item.position.y === y && item.status === 'NOT_COLLECTED');


  const completeMission = async () => {
    if (!user || !mission) {
      console.error("Cannot complete mission:", { 
        hasUser: !!user, 
        hasMission: !!mission,
        user,
        mission 
      });
      return;
    }
    
    console.log("Starting mission completion process:", {
      missionId: mission.id,
      missionTitle: mission.title,
      userId: user.id,
      username: user.username,
      hasAllItems: allItemsCollected,
      itemsCollected: user.itemsCollected
    });

    try {
      dispatch(setIsSavingMission(true));
      const result = await addCompletedMission({ mission }).unwrap();
      console.log("Mission completion result:", result);
      
      // Show success message
      toast.success('Mission completed!');
      
      // Start the next mission
      dispatch(startMission({ nextMission: true }));
    } catch (error) {
      console.error("Mission completion failed:", {
        error,
        missionId: mission.id,
        missionTitle: mission.title,
        userId: user.id,
        username: user.username
      });
      toast.error('Failed to complete mission');
    } finally {
      dispatch(setIsSavingMission(false));
    }
  };

  if (isError) {
    return <div>{error.toString()}</div>
  }

  if (isSuccess || isLoading) {
    return (
      <section className="min-h-full" onClick={() => {
        if (playerIsLeftOfTile) {
          dispatch(moveRight())
        }
        if (playerIsRightOfTile) {
          dispatch(moveLeft())
        }
        if (playerIsAboveTile) {
          dispatch(moveDown())
        }
        if (playerIsBelowTile) {
          dispatch(moveUp())
        }
      }}>
        <figure className="bg-slate-200 rounded-xl p-3 w-full">
          <div className="h-8 md:h-12 lg:h-20 flex justify-between">

          
            {playerIsOnTile ? (
              <UserCircleIcon className="block h-8 md:h-12 lg:h-20" data-testid="usericon" aria-hidden="true" />
            ) : <div />}
            {tileItem ? (
              <Image
                src={`./google-cloud-icons/${tileItem.title}.svg`}
                alt={`icon of ${tileItem.title}`}
                width='80'
                height='80'
                className='align-right text-right w-auto'
              />
            ) : ((playerIsOnStartingTile || allItemsCollected) && !tileIsFinalTile && !playerIsOnTile && (
              <div className={`block sm:hidden text-slate-500 transition-opacity ease-in-out delay-1000 duration-1000 ${playerIsOnStartingTile && isSuccess && playerIsOnAdjacentTile ? 'opacity-100' : 'opacity-0'}`}>
                Click here to move to this tile.
              </div>
            ))}
            {allItemsCollected && tileIsFinalTile && (
              <Image
                src='/Google_Cloud_logo.svg'
                alt='Google Cloud Logo'
                width='80'
                height='80'
                className='align-right text-right w-auto'
              />
            )}
          </div>
          <div className="h-10 text-center">
            {playerIsOnTile && tileItem && (
              <button
                className='bg-blue-500 hover:bg-blue-700 text-white p-2 rounded'
                onClick={() => dispatch(collectItem())}
              >
                Collect
              </button>
            )}
            {allItemsCollected && tileIsFinalTile && playerIsOnTile && (
              <button
                className='bg-blue-500 hover:bg-blue-700 text-white p-2 rounded disabled:bg-slate-50 disabled:text-slate-500'
                disabled={!playerIsOnTile || isSavingMission} onClick={completeMission}
              >
                {isSavingMission ? 'Saving...' : 'Complete'}
              </button>
            )}
          </div>
        </figure>
      </section>
    )
  }

  // TODO: Better fall through logic, but can't return 'Element | undefined'
  return <div>Something has gone terribly wrong with tile.tsx</div>
}
