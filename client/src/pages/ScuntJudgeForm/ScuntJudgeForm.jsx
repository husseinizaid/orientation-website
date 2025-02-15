import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import './ScuntJudgeForm.scss';
import { TextInput } from '../../components/input/TextInput/TextInput';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../../state/user/userSlice';
import ReactSlider from 'react-slider';
import { Dropdown } from '../../components/form/Dropdown/Dropdown';
import { Button } from '../../components/button/Button/Button';
import { QRScannerDisplay } from '../../components/QRScannerDisplay/QRScannerDisplay';
import { SnackbarContext } from '../../util/SnackbarProvider';
import { scuntSettingsSelector } from '../../state/scuntSettings/scuntSettingsSlice';
import { getScuntSettings } from '../../state/scuntSettings/saga';
// import { submitBribePoints } from './functions';
import greenCheck from '../../assets/misc/check-solid-green.svg';
import { scuntMissionsSelector } from '../../state/scuntMissions/scuntMissionsSlice';
import { getScuntMissions } from '../../state/scuntMissions/saga';
import { missionStatusSelector, scuntTeamsSelector } from '../../state/scuntTeams/scuntTeamsSlice';
import {
  addPoints,
  getMissionStatus,
  getScuntTeams,
  submitBribePoints,
  subtractPoints,
} from '../../state/scuntTeams/saga';

export const getScuntTeamObjFromTeamName = (teamName, teamObjs) => {
  if (!teamName || !teamObjs) {
    return {};
  }
  return teamObjs.filter((teamObj) => {
    return teamObj?.name === teamName;
  })[0];
};

export const getScuntTeamObjFromTeamNumber = (teamNumber, teamObjs) => {
  if (!teamNumber || !teamObjs) {
    return {};
  }
  return teamObjs.filter((teamObj) => {
    return teamObj?.number === parseInt(teamNumber);
  })[0];
};

export const PageScuntJudgeForm = () => {
  const { user } = useSelector(userSelector);
  const dispatch = useDispatch();
  const { missions } = useSelector(scuntMissionsSelector);
  const { scuntTeams } = useSelector(scuntTeamsSelector);
  const { scuntSettings } = useSelector(scuntSettingsSelector);
  const { setSnackbar } = useContext(SnackbarContext);

  const [teams, setTeams] = useState(['Select Team']);
  const [teamObjs, setTeamObjs] = useState();

  useEffect(() => {
    dispatch(getScuntMissions({ showHidden: false, setSnackbar }));
    dispatch(getScuntSettings(setSnackbar));
    dispatch(getScuntTeams(setSnackbar));
  }, []);

  useEffect(() => {
    if (scuntTeams?.length) {
      setTeamObjs(scuntTeams);
      setTeams(['Select Team', ...scuntTeams.map((team) => team?.name)]);
    }
  }, [scuntTeams]);

  if (!scuntSettings?.allowJudging)
    return (
      <div className="scunt-judge-form-page">
        <div className="scunt-judge-form-container">
          <h1>Judging is not currently allowed.</h1>
        </div>
      </div>
    );

  return (
    <div className="scunt-judge-form-page">
      <div className="scunt-judge-form-container">
        <h1>Judge Dashboard</h1>
        <h3>
          Hello,{' '}
          {user?.preferredName === '' || !user?.preferredName
            ? user?.firstName
            : user?.preferredName}
        </h3>
        <ScuntMissionSelection teams={teams} missions={missions} teamObjs={teamObjs} />
        <div className="separator" />
        <ScuntBribePoints teams={teams} teamObjs={teamObjs} />
        <div className="separator" />
        <ScuntNegativePoints teams={teams} teamObjs={teamObjs} />
      </div>
    </div>
  );
};

const ScuntNegativePoints = ({ teams, teamObjs }) => {
  const maxRemovePoints = 1000;
  const [assignedPoints, setAssignedPoints] = useState(0);
  const [assignedTeam, setAssignedTeam] = useState('');
  const [clearPointsInput, setClearPointsInput] = useState(false);

  const { setSnackbar } = useContext(SnackbarContext);

  const dispatch = useDispatch();

  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: '15px' }} />
      <h2>Remove Points</h2>
      <>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginLeft: '5px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ width: '100%' }}>
            <Dropdown
              label={'Team'}
              initialSelectedIndex={0}
              values={teams}
              onSelect={(value) => {
                setAssignedTeam(getScuntTeamObjFromTeamName(value, teamObjs));
              }}
              isDisabled={false}
            />
          </div>
          <div>
            <TextInput
              label={'Points'}
              placeholder={`${assignedPoints}`}
              onChange={(value) => {
                if (isNaN(parseInt(value))) {
                  return;
                }
                if (value === '' || value === undefined) {
                  setAssignedPoints(0);
                } else if (parseInt(value) >= maxRemovePoints) {
                  setAssignedPoints(maxRemovePoints);
                } else {
                  setAssignedPoints(parseInt(value));
                }
              }}
              setClearText={setClearPointsInput}
              clearText={clearPointsInput}
            />
          </div>
        </div>
        <div style={{ height: '10px' }} />
        <ReactSlider
          value={assignedPoints}
          defaultValue={0}
          max={maxRemovePoints}
          min={0}
          className="horizontal-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
          onChange={(value) => {
            setAssignedPoints(value);
            setClearPointsInput(true);
          }}
        />
        <div style={{ height: '60px' }} />
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <Button
            label={'Remove Points'}
            onClick={async () => {
              if (
                assignedTeam === 'Select Team' ||
                !assignedTeam ||
                assignedTeam === '' ||
                Object.keys(assignedTeam).length <= 0
              ) {
                setSnackbar('Please select a team!', true);
                return;
              }
              setAssignedPoints(0);
              //Subtract points here

              dispatch(
                subtractPoints({
                  teamNumber: assignedTeam?.number,
                  points: assignedPoints,
                  setSnackbar,
                }),
              );

              setClearPointsInput(true);
            }}
          />
        </div>
        <h2 style={{ textAlign: 'center' }}>{assignedTeam?.name}</h2>
        <h3 style={{ textAlign: 'center' }}>-{assignedPoints} Points</h3>
      </>
    </div>
  );
};

ScuntNegativePoints.propTypes = {
  teams: PropTypes.array,
  teamObjs: PropTypes.array,
};

const ScuntBribePoints = ({ teams, teamObjs }) => {
  const { user } = useSelector(userSelector);
  const [remainingBribePoints, setRemainingBribePoints] = useState(user?.scuntJudgeBribePoints);
  const [assignedPoints, setAssignedPoints] = useState(0);
  const [assignedTeam, setAssignedTeam] = useState('');
  const [clearPointsInput, setClearPointsInput] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setRemainingBribePoints(user?.scuntJudgeBribePoints);
  }, [user]);

  const { setSnackbar } = useContext(SnackbarContext);
  const submitBribe = async (teamNumber, points) => {
    if (points <= 0 || points === undefined) {
      setSnackbar('You cannot give 0 points!', true);
    } else {
      dispatch(submitBribePoints({ teamNumber, points, setSnackbar }));
      setAssignedPoints(0);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: '15px' }} />
      <h2>Bribe Points</h2>
      <h4>Remaining bribe points: {remainingBribePoints}</h4>
      {remainingBribePoints === 0 ? (
        <div style={{ height: '15px' }}></div>
      ) : (
        <>
          <div style={{ height: '10px' }} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginLeft: '5px',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ width: '100%' }}>
              <Dropdown
                label={'Team'}
                initialSelectedIndex={0}
                values={teams}
                onSelect={(value) => {
                  setAssignedTeam(getScuntTeamObjFromTeamName(value, teamObjs));
                }}
                isDisabled={false}
              />
            </div>
            <div>
              <TextInput
                label={'Points'}
                placeholder={`${assignedPoints}`}
                onChange={(value) => {
                  if (isNaN(parseInt(value))) {
                    return;
                  }
                  if (value === '' || value === undefined) {
                    setAssignedPoints(0);
                  } else if (parseInt(value) >= remainingBribePoints) {
                    setAssignedPoints(remainingBribePoints);
                  } else {
                    setAssignedPoints(parseInt(value));
                  }
                }}
                setClearText={setClearPointsInput}
                clearText={clearPointsInput}
              />
            </div>
          </div>
          <div style={{ height: '10px' }} />
          <ReactSlider
            value={assignedPoints}
            defaultValue={0}
            max={remainingBribePoints > 500 ? 500 : remainingBribePoints}
            min={0}
            className="horizontal-slider"
            thumbClassName="slider-thumb"
            trackClassName="slider-track"
            renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
            onChange={(value) => {
              setAssignedPoints(value);
              setClearPointsInput(true);
            }}
          />
          <div style={{ height: '60px' }} />
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <Button
              label={'Give Bribe Points'}
              onClick={() => {
                if (
                  assignedTeam === 'Select Team' ||
                  !assignedTeam ||
                  assignedTeam === '' ||
                  Object.keys(assignedTeam).length <= 0
                ) {
                  setSnackbar('Please select a team!', true);
                  return;
                }

                setClearPointsInput(true);
                if (assignedPoints <= 0 || assignedPoints === undefined) {
                  setSnackbar('You cannot give 0 points!', true);
                } else {
                  dispatch(
                    submitBribePoints({
                      teamNumber: assignedTeam?.number,
                      assignedPoints,
                      setSnackbar,
                    }),
                  );
                  setAssignedPoints(0);
                }
                // setRemainingBribePoints(remainingBribePoints - assignedPoints);
              }}
            />
          </div>
          <h2 style={{ textAlign: 'center' }}>{assignedTeam?.name}</h2>
          <h3 style={{ textAlign: 'center' }}>+{assignedPoints} Points</h3>
        </>
      )}
    </div>
  );
};

ScuntBribePoints.propTypes = {
  teams: PropTypes.array,
  teamObjs: PropTypes.array,
};

const ScuntMissionSelection = ({ missions, teams, teamObjs }) => {
  const { scuntSettings } = useSelector(scuntSettingsSelector);
  const { missionStatus } = useSelector(missionStatusSelector);
  const { setSnackbar } = useContext(SnackbarContext);
  const [maxAmountPointsPercent, setMaxAmountPointsPercent] = useState(0);
  const [minAmountPointsPercent, setMinAmountPointsPercent] = useState(0);
  const [assignedMission, setAssignedMission] = useState(undefined);
  const [searchedMissions, setSearchedMissions] = useState([]);
  const [assignedPoints, setAssignedPoints] = useState(0);
  const [assignedTeam, setAssignedTeam] = useState('');
  const [clearText, setClearText] = useState(false);
  const [clearPointsInput, setClearPointsInput] = useState(false);
  const [hasQRScanned, setHasQRScanned] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getScuntSettings(setSnackbar));
  }, [dispatch]);

  useEffect(() => {
    if (scuntSettings) {
      setMinAmountPointsPercent(scuntSettings.minAmountPointsPercent);
      setMaxAmountPointsPercent(scuntSettings.maxAmountPointsPercent);
    }
  }, [scuntSettings]);

  useEffect(() => {
    if (assignedMission && assignedTeam)
      dispatch(
        getMissionStatus({
          missionNumber: assignedMission?.number,
          teamNumber: assignedTeam?.number,
        }),
      );
  }, [dispatch, assignedMission, assignedTeam]);

  useEffect(() => {
    if (missionStatus) {
      setAssignedPoints(missionStatus?.points || assignedMission?.points);
    }
  }, [missionStatus]);

  const getMissionSearchName = (searchName) => {
    if (searchName === '') {
      setSearchedMissions([]);
      return;
    }
    const output = [];
    for (let mission of missions) {
      if (mission?.name?.toLowerCase().includes(searchName.toLowerCase())) {
        output.push(mission);
      }
    }
    setSearchedMissions(output);
  };

  const getMissionSearchID = (searchNumber) => {
    for (let mission of missions) {
      if (mission?.number?.toString() === searchNumber.toString()) {
        setSearchedMissions([mission]);
        setAssignedMission(mission);
        setAssignedPoints(mission?.points);
        return;
      }
    }
    getMissionSearchName('');
  };

  return (
    <>
      <QRScannerDisplay
        setScannedData={(data) => {
          const missionID = data.split('|')[1];
          if (missionID === undefined) {
            setSnackbar('There was an error with the QR code', true);
            return;
          }
          for (let mission of missions) {
            if (mission?.number.toString() === missionID.toString()) {
              setAssignedPoints(mission?.points);
              setAssignedMission(undefined);
              setAssignedMission(mission);
            }
          }
          const teamNumber = data.split('|')[0];
          if (teamNumber === undefined) {
            setSnackbar('There was an error with the QR code', true);
            return;
          }
          setAssignedTeam(getScuntTeamObjFromTeamNumber(teamNumber, teamObjs));
          setHasQRScanned(true);
        }}
      />
      <h2>Mission Points</h2>
      <p className="text-input-title">{'Search for a mission'}</p>
      <div className="small-width-input">
        <TextInput
          clearText={clearText}
          setClearText={setClearText}
          placeholder={'#'}
          errorFeedback={''}
          onChange={(value) => {
            if (hasQRScanned === true) setHasQRScanned(false);
            setAssignedMission(undefined);
            getMissionSearchID(value);
          }}
          onEnterKey={(value) => {
            if (hasQRScanned === true) setHasQRScanned(false);
            setAssignedMission(searchedMissions[0]);
            setAssignedPoints(searchedMissions[0]?.points);
          }}
        />
      </div>
      <div className="fill-remaining-width-input">
        <TextInput
          clearText={clearText}
          setClearText={setClearText}
          placeholder={'Search by name'}
          errorFeedback={''}
          onChange={(value) => {
            if (hasQRScanned === true) setHasQRScanned(false);
            setAssignedMission(undefined);
            getMissionSearchName(value);
          }}
          onEnterKey={(value) => {
            if (hasQRScanned === true) setHasQRScanned(false);
            setAssignedMission(searchedMissions[0]);
            setAssignedPoints(searchedMissions[0]?.points);
          }}
        />
      </div>
      {assignedMission !== undefined ? (
        <div style={{ width: '100%', cursor: 'pointer', marginRight: '9px' }}>
          <ScuntMissionEntry
            mission={assignedMission}
            selected
            completed={missionStatus?.completed}
            pointsAwarded={missionStatus?.points}
          />
        </div>
      ) : (
        searchedMissions.map((mission) => {
          return (
            <div
              key={mission?.number}
              style={{ width: '100%', cursor: 'pointer', marginRight: '9px' }}
              onClick={() => {
                setAssignedMission(mission);
                setAssignedPoints(mission?.points);
              }}
            >
              <ScuntMissionEntry
                mission={mission}
                completed={missionStatus?.completed}
                pointsAwarded={missionStatus?.points}
              />
            </div>
          );
        })
      )}
      {assignedMission !== undefined ? (
        <div style={{ width: '100%', marginRight: '2px', marginTop: '10px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginLeft: '5px',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {hasQRScanned === false ? (
              <div style={{ width: '100%' }}>
                <Dropdown
                  label={'Team'}
                  initialSelectedIndex={0}
                  values={teams}
                  onSelect={(value) => {
                    if (value !== 'Select Team')
                      setAssignedTeam(getScuntTeamObjFromTeamName(value, teamObjs));
                  }}
                  isDisabled={false}
                />
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <p style={{ marginBottom: '8px' }}>Team</p>
                <h2>{assignedTeam?.name}</h2>
              </div>
            )}
            <div>
              <TextInput
                label={'Points'}
                placeholder={`${assignedPoints}`}
                onChange={(value) => {
                  if (isNaN(parseInt(value))) {
                    return;
                  }
                  const maxPoints =
                    parseInt(assignedMission?.points) +
                    parseInt(assignedMission?.points * maxAmountPointsPercent);
                  const minPoints =
                    parseInt(assignedMission?.points) -
                    parseInt(assignedMission?.points * minAmountPointsPercent);
                  if (value === '' || value === undefined) {
                    setAssignedPoints(assignedMission?.points);
                  } else if (parseInt(value) >= maxPoints) {
                    setAssignedPoints(maxPoints);
                  } else if (parseInt(value) <= minPoints) {
                    setAssignedPoints(minPoints);
                  } else {
                    setAssignedPoints(parseInt(value));
                  }
                }}
                setClearText={setClearPointsInput}
                clearText={clearPointsInput}
              />
            </div>
          </div>
          {missionStatus?.completed ? (
            <>
              <div style={{ height: '15px' }} />
              <p style={{ textAlign: 'center' }}>
                <b>
                  {'This mission has already been completed by this team. They earned ' +
                    missionStatus?.points +
                    ' points.'}
                </b>
              </p>
            </>
          ) : null}
          <div style={{ height: '15px' }} />
          <ReactSlider
            value={assignedPoints}
            defaultValue={parseInt(assignedMission?.points)}
            max={
              parseInt(assignedMission?.points) +
              parseInt(assignedMission?.points * maxAmountPointsPercent)
            }
            min={
              parseInt(assignedMission?.points) -
              parseInt(assignedMission?.points * minAmountPointsPercent)
            }
            className="horizontal-slider"
            thumbClassName="slider-thumb"
            trackClassName="slider-track"
            renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
            onChange={(value) => {
              setAssignedPoints(value);
              setClearPointsInput(true);
            }}
          />
          <div
            style={{
              width: '100%',
              marginTop: '60px',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <Button
              label={'Submit'}
              onClick={async () => {
                if (assignedTeam === 'Select Team' || !assignedTeam) {
                  setSnackbar('Please select a team!', true);
                  return;
                }
                dispatch(
                  addPoints({
                    teamNumber: assignedTeam?.number,
                    missionNumber: assignedMission?.number,
                    points: assignedPoints,
                    setSnackbar,
                  }),
                );
                setAssignedPoints(0);
                setClearText(true);
                setAssignedMission(undefined);
                setSearchedMissions([]);
                setHasQRScanned(false);
              }}
            />
          </div>
          <h2 style={{ textAlign: 'center' }}>{assignedTeam?.name}</h2>
          <h3 style={{ textAlign: 'center' }}>
            Mission {assignedMission?.number} - {assignedPoints} Points
          </h3>
        </div>
      ) : null}
    </>
  );
};

ScuntMissionSelection.propTypes = {
  missions: PropTypes.array,
  teams: PropTypes.array,
  teamObjs: PropTypes.array,
};

export const ScuntMissionEntry = ({ mission, selected, completed, pointsAwarded }) => {
  return (
    <div className={`scunt-mission-entry ${selected ? 'scunt-mission-entry-selected' : ''}`}>
      <h3 className="mission-id">{mission?.number}</h3>
      {completed ? (
        <img
          src={greenCheck}
          alt="judging station indication"
          className="scunt-mission-entry-judging-star"
        />
      ) : null}
      <p className="mission-name">{mission?.name}</p>

      <h3 className="mission-points">
        {completed ? pointsAwarded / mission?.points : mission?.points}
      </h3>
    </div>
  );
};

ScuntMissionEntry.propTypes = {
  completed: PropTypes.bool,
  pointsAwarded: PropTypes.number,
  mission: PropTypes.object,
  selected: PropTypes.bool,
};

ScuntMissionEntry.defaultProps = {
  completed: false,
  pointsAwarded: 0,
};
