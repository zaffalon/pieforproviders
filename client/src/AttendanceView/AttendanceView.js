import React, { useEffect, useRef, useState } from 'react'
import { Button, Grid, Table } from 'antd'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { useApiResponse } from '_shared/_hooks/useApiResponse'
import { useProgress } from '_shared/_hooks/useProgress'
import { useGoogleAnalytics } from '_shared/_hooks/useGoogleAnalytics'
import smallPie from '../_assets/smallPie.png'
import { ReactComponent as EditIcon } from '../_assets/editIcon.svg'
import { setLoading } from '_reducers/uiReducer'
import '_assets/styles/edit-icon.css'
import { WeekPicker } from './WeekPicker'
import { EditAttendanceModal } from './EditAttendanceModal'
import { LoadingDisplay } from '_shared/LoadingDisplay'
import { setFilteredCases } from '_reducers/uiReducer'
import SiteFilterSelect from '_shared/SiteFilterSelect'

const { useBreakpoint } = Grid

export function AttendanceView() {
  const dispatch = useDispatch()
  const { i18n, t } = useTranslation()
  const { parseResult } = useProgress()
  const { sendGAEvent } = useGoogleAnalytics()
  const screens = useBreakpoint()
  const history = useHistory()
  const { makeRequest } = useApiResponse()
  const { businesses, filteredCases } = useSelector(state => ({
    businesses: state.businesses,
    filteredCases: state.ui.filteredCases
  }))
  const [attendanceData, setAttendanceData] = useState([])
  // columns will be current dates
  const { isLoading, token } = useSelector(state => ({
    isLoading: state.ui.isLoading,
    token: state.auth.token
  }))
  const [dateSelected, setDateSelected] = useState(dayjs())
  // TODO Refactor: rename and rework this to be a boolean flag to show the modal, and pass
  // attendanceData directly to the modal to fill the fields
  const [editAttendanceModalData, setEditAttendanceModalData] = useState(null)
  // TODO Refactor: rename this hook to just be attendanceData and setAttendanceData
  const [updatedAttendanceData, setUpdatedAttendanceData] = useState({
    absenceType: null,
    date: null,
    attendances: [{}, {}]
  })
  // TODO Refactor: move the modal logic into its own component
  const [modalButtonDisabled, setModalButtonDisabled] = useState(false)
  const latestAttendanceData = useRef(updatedAttendanceData)
  const titleData = useRef({ childName: null, columnDate: null })

  const updateAttendanceData = ({ record, secondCheckIn, update }) => {
    const index = secondCheckIn ? 1 : 0

    const updatedData = {
      absenceType: Object.keys(update).includes('absenceType')
        ? update.absenceType
        : latestAttendanceData.current.absenceType,
      date: latestAttendanceData.current.date,
      attendances: latestAttendanceData.current.attendances.map(
        (currentAttendance, i) => {
          if (index === i) {
            // Make an object from only check_in and check_out, we don't want
            // absence type for attendances
            const updatedAttendance = Object.fromEntries(
              Object.entries(update).filter(
                entry => entry[0] === 'check_in' || entry[0] === 'check_out'
              )
            )
            const updatedKeys = Object.keys(updatedAttendance)
            const currentKeys = Object.keys(currentAttendance)

            /* 
              var definition of updatedValue
              if nothing has been updated OR
              if the current value has an absence key and the updated data has check-in or check-out keys OR
              if the updated data has an absence key and the current value has check-in or check-out keys
              then use the updated data exclusively
              otherwise, spread the current value and the updated data together
            */
            const updatedValue =
              updatedKeys.length === 0 ||
              (latestAttendanceData.current.absenceType &&
                (updatedKeys.includes('check_in') ||
                  updatedKeys.includes('check_out'))) ||
              (update.absenceType &&
                (currentKeys.includes('check_in') ||
                  currentKeys.includes('check_out')))
                ? updatedAttendance
                : { ...currentAttendance, ...updatedAttendance }

            /* 
              var definition of mergedValue
              if the current value has no keys (i.e. does not yet exist)
              then merge the updated data with the child id from the data's serviceDays
              otherwise, spread the current value and updatedValue together
              TODO Refactor: is this second spread necessary?  Or could we just say updatedValue?
              Some of this looping seems extra
            */
            const mergedValue =
              Object.keys(currentAttendance).length === 0
                ? {
                    child_id: record?.serviceDays[0]?.child_id || '',
                    ...updatedValue
                  }
                : {
                    ...currentAttendance,
                    ...updatedValue
                  }

            // disabled saving on modal if only checkout time exists
            // TODO Refactor: no attendance should be saveable with a check-out and no check-in
            if (index === 0) {
              setModalButtonDisabled(
                !(mergedValue.check_in || update.absenceType)
              )
            }

            return mergedValue
          }

          return currentAttendance
        }
      )
    }

    if (updatedData.absenceType === undefined) {
      // eslint-disable-next-line no-debugger
      debugger
    }

    latestAttendanceData.current = updatedData
    setUpdatedAttendanceData(updatedData)
  }

  // create seven columns for each day of the week
  const generateColumns = () => {
    const dateColumns = []

    for (let i = 0; i < 7; i++) {
      const columnDate = dateSelected.day(i)
      dateColumns.push({
        dataIndex: i,
        key: i,
        width: 275,
        // eslint-disable-next-line react/display-name
        title: () => {
          const monthDate = columnDate.format('MMM DD')
          return (
            <div className="grid text-gray9 justify-items-center ">
              <div>{t(`${columnDate.format('ddd').toLocaleLowerCase()}`)} </div>
              <div className="font-semibold">{`${t(
                monthDate.slice(0, 3).toLowerCase()
              )} ${monthDate.slice(4, 6)}`}</div>
            </div>
          )
        },

        render: (_, record) => {
          const matchingServiceDay = record.serviceDays.find(serviceDay => {
            return new RegExp(columnDate.format('YYYY-MM-DD')).test(
              serviceDay.date
            )
          })
          const hideEditButton =
            matchingServiceDay?.child?.wonderschool_id || false

          const handleEditAttendance = () => {
            const serviceDay = record.serviceDays.find(
              day => day.date.slice(0, 10) === columnDate.format('YYYY-MM-DD')
            )
            const attendances =
              serviceDay.attendances.length === 0
                ? [{}, {}]
                : serviceDay.attendances.length === 2
                ? serviceDay.attendances
                : [...serviceDay.attendances, {}]

            setEditAttendanceModalData({
              record,
              columnDate: columnDate.format('YYYY-MM-DD'),
              defaultValues: {
                absenceType: matchingServiceDay.absence_type,
                attendances: attendances
              },
              updateAttendanceData
            })

            titleData.current = {
              childName: record.child,
              columnDate
            }
            latestAttendanceData.current = {
              absenceType: matchingServiceDay.absence_type,
              date: columnDate.format('YYYY-MM-DD'),
              attendances: attendances
            }
            if (matchingServiceDay.absence_type === undefined) {
              // eslint-disable-next-line no-debugger
              debugger
            }
            setUpdatedAttendanceData({
              absenceType: matchingServiceDay.absence_type,
              date: columnDate.format('YYYY-MM-DD'),
              attendances: attendances
            })
          }

          if (matchingServiceDay !== undefined) {
            if (matchingServiceDay.tags.includes('absence')) {
              return (
                <div>
                  {hideEditButton ? null : (
                    <button
                      className="float-right edit-icon"
                      onClick={handleEditAttendance}
                    >
                      <EditIcon />
                    </button>
                  )}
                  <div className="flex justify-center">
                    <div
                      className="box-border p-1 bg-orange2 text-orange3"
                      data-cy="absent"
                    >
                      {t('absent').toLowerCase()}
                    </div>
                  </div>
                </div>
              )
            }
            const checkInCheckOutTime = matchingServiceDay.attendances
              .map(attendance => {
                const check_in = dayjs(
                  attendance.check_in,
                  'YYYY-MM-DD hh:mm'
                ).format('h:mm a')
                const check_out = attendance.check_out
                  ? dayjs(attendance.check_out, 'YYYY-MM-DD hh:mm').format(
                      'h:mm a'
                    )
                  : 'no check out time'
                return `${check_in} - ${check_out}`
              })
              .join(', ')
            const hour = Math.floor(
              Number(matchingServiceDay.total_time_in_care) / 3600
            )
            const minute = Math.floor(
              Number(matchingServiceDay.total_time_in_care % 3600) / 60
            )
            const totalTimeInCare = hour + ' hrs ' + minute + ' mins'

            const tags = (matchingServiceDay.tags || []).map((tag, i) => {
              let amount = tag.split(' ')[0]
              let count = parseInt(amount, 10) <= 1 ? 1 : 0

              return (
                <div
                  key={i}
                  className={`bg-green2 text-green1 box-border p-1 mt-1 ${
                    i > 0 ? 'ml-1' : null
                  }`}
                >
                  {`${amount} `}
                  {i18n.t(`${tag.split(' ')[1].toLowerCase()}`, {
                    count: count
                  })}
                </div>
              )
            })
            return (
              <div className="relative text-center body-2">
                {hideEditButton ? null : (
                  <button
                    onClick={handleEditAttendance}
                    className="absolute right-0 rounded-full group hover:bg-blue3 focus:bg-primaryBlue"
                  >
                    <EditIcon className="m-1.5 fill-gray3 group-hover:fill-primaryBlue group-focus:fill-white" />
                  </button>
                )}
                <div className="mb-2 text-gray8 font-semiBold">
                  {totalTimeInCare}
                </div>
                <div className="text-xs text-darkGray">
                  {checkInCheckOutTime}
                </div>
                <div className="flex justify-center">{tags}</div>
              </div>
            )
          }
          return (
            <div className="flex justify-center">
              <div className="box-border p-1 bg-mediumGray" data-cy="noInfo">
                {t('noInfo')}
              </div>
            </div>
          )
        }
      })
    }

    return [
      {
        dataIndex: 'name',
        key: 'name',
        width: 150,
        title: (
          <div className="grid font-semibold text-gray9 justify-items-center ">
            {t('name')}
          </div>
        ),
        // eslint-disable-next-line react/display-name
        render: (_, record) => (
          <div className="eyebrow-large text-gray1">{record.child}</div>
        )
      },
      ...dateColumns
    ]
  }
  const [columns, setColumns] = useState(generateColumns())
  i18n.on('languageChanged', () => setColumns(generateColumns()))

  const handleDateChange = newDate => {
    // send google analytics event data about changing the current week selected
    sendGAEvent('dates_filtered', {
      date_selected: `${newDate.weekday(0).format('MMM D')} -
      ${newDate.weekday(6).format('MMM D, YYYY')}`,
      page_title: 'attendance'
    })

    setDateSelected(newDate)
  }

  const getServiceDays = async (businessIds = []) => {
    dispatch(setLoading(true))
    const response = await makeRequest({
      type: 'get',
      url: `/api/v1/service_days?filter_date=${dateSelected.format(
        'YYYY-MM-DD'
      )}&business=${businessIds.length > 0 ? businessIds.join(',') : ''}`,
      headers: {
        Authorization: token
      },
      data: {}
    })

    if (response.ok) {
      const parsedResponse = await parseResult(response)
      const addServiceDay = (previousValue, currentValue) => {
        const childName =
          `${currentValue?.child.first_name} ${currentValue?.child.last_name}` ||
          ''
        const index = previousValue.findIndex(item => item?.child === childName)
        index >= 0
          ? previousValue[index].serviceDays.push(currentValue)
          : previousValue.push({
              child: childName,
              key: `${childName}${currentValue.date}`,
              serviceDays: [currentValue]
            })
        return previousValue
      }

      const reducedData = parsedResponse.reduce(addServiceDay, [])
      dispatch(setFilteredCases(businessIds))
      setAttendanceData(reducedData)
      setColumns(generateColumns())
    }
    dispatch(setLoading(false))
  }

  const handleModalSave = async () => {
    let responses = []
    const formatAttendanceData = attendance => {
      let checkIn, checkOut
      if (attendance.check_in) {
        if (dayjs(attendance.check_in).isValid()) {
          checkIn = dayjs(attendance.check_in)
        } else if (
          dayjs(
            `${latestAttendanceData.current.date} ${attendance.check_in}`
          ).isValid()
        ) {
          checkIn = dayjs(
            `${latestAttendanceData.current.date} ${attendance.check_in}`
          )
        } else {
          checkIn = null
        }
      }

      if (attendance.check_out) {
        if (dayjs(attendance.check_out).isValid()) {
          checkOut = dayjs(attendance.check_out)
        } else if (
          dayjs(
            `${latestAttendanceData.current.date} ${attendance.check_out}`
          ).isValid()
        ) {
          checkOut = dayjs(
            `${latestAttendanceData.current.date} ${attendance.check_out}`
          )
        } else {
          checkOut = null
        }
      }
      return {
        check_in: checkIn ? checkIn.format() : null,
        check_out: checkOut
          ? checkIn.isAfter(checkOut)
            ? checkOut.add(1, 'day').format()
            : checkOut.format()
          : null
      }
    }

    // TODO: when editing an absence w/ existing attendances, some attendances are being sent to the
    // API w/ null and invalid date values

    if (updatedAttendanceData.absenceType) {
      // If we're an absence, push an update to the first attendance
      // This is a workaround because the attendance/service day API isn't fully fleshed
      // out yet, there's no updating service days
      const response = await makeRequest({
        type: 'put',
        url: '/api/v1/attendances/' + updatedAttendanceData.attendances[0].id,
        headers: {
          Authorization: token
        },
        data: {
          attendance: {
            service_day_attributes: {
              absence_type: updatedAttendanceData.absenceType
            }
          }
        }
      })
      responses.push(response)
    } else {
      updatedAttendanceData.attendances
        .filter(attendance => Object.keys(attendance).length > 0)
        .forEach(async attendance => {
          // if it's an old attendance we call the attendances PUT endpoint,
          // if the user creates a new, second attendance for that day we need to call the attendance_batches endpoint
          // if the attendance values needed are all null the attendance needs to be deleted
          if (!attendance.check_in && !attendance.check_out && attendance.id) {
            const response = await makeRequest({
              // when you delete a second check-in/attendance
              type: 'del',
              url: '/api/v1/attendances/' + attendance.id,
              headers: {
                Authorization: token
              }
            })
            responses.push(response)
          } else if (Object.keys(attendance).includes('child_id')) {
            // when you add a second check-in/attendance that didn't exist
            const response = await makeRequest({
              type: 'post',
              url: '/api/v1/attendance_batches',
              headers: {
                Authorization: token
              },
              data: {
                attendance_batch: [
                  {
                    ...formatAttendanceData(attendance),
                    child_id: attendance.child_id,
                    service_day_attributes: {
                      absence_type: updatedAttendanceData.absenceType
                    }
                  }
                ]
              }
            })
            responses.push(response)
          } else if (Object.keys(attendance).length > 0) {
            // when you change any existing check-in/attendance
            const response = await makeRequest({
              type: 'put',
              url: '/api/v1/attendances/' + attendance.id,
              headers: {
                Authorization: token
              },
              data: {
                attendance: {
                  ...formatAttendanceData(attendance),
                  service_day_attributes: {
                    absence_type: updatedAttendanceData.absenceType
                  }
                }
              }
            })
            responses.push(response)
          }
        })
    }

    const responsesOk = responses.every(r => r.ok)

    if (!responsesOk) {
      // TODO: better logging of errors
      console.log('error sending attendance data to API')
    }

    titleData.current = {
      childName: null,
      columnDate: null
    }
    latestAttendanceData.current = {
      absenceType: null,
      date: null,
      attendances: [{}, {}]
    }
    setEditAttendanceModalData(null)
    setUpdatedAttendanceData({
      absenceType: null,
      date: null,
      attendances: [{}, {}]
    })
  }

  useEffect(() => {
    getServiceDays(filteredCases)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateSelected])

  return (
    <div>
      {screens.sm ? (
        <div>
          <div className="flex justify-center mb-4 h1-large">
            <div>
              <div>{t('attendance')}</div>
            </div>
            <Button
              type="primary"
              className="absolute bg-primaryBlue"
              style={{ right: '3rem' }}
              onClick={() => {
                sendGAEvent('attendance_input_clicked', {
                  page_title: 'attendance'
                })
                history.push('/attendance/edit')
              }}
              data-cy="inputAttendance"
            >
              {t('inputAttendance')}
            </Button>
          </div>
          <div>
            <WeekPicker
              hasNext={dateSelected.day(6) < dayjs().day(0)}
              dateSelected={dateSelected}
              handleDateChange={handleDateChange}
            />
          </div>
          <div className="relative pt-5">
            <SiteFilterSelect
              businesses={businesses}
              onChange={value => getServiceDays(value)}
            />
          </div>
          <Table
            dataSource={[...attendanceData]}
            columns={columns}
            bordered={true}
            pagination={false}
            sticky
            scroll={{ x: 1500 }}
            className="my-5"
            loading={{
              spinning: isLoading,
              indicator: <LoadingDisplay />
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="mb-8 font-semibold text-center h3-large">
            {t('screenSize')}
          </div>
          <img src={smallPie} alt={'a small lemon pie'} />
          <div className="mt-8 text-center text-black body-1">
            {t('incompatibleMsg')}
          </div>
        </div>
      )}
      <EditAttendanceModal
        editAttendanceModalData={editAttendanceModalData}
        handleModalSave={async () => {
          await handleModalSave()
          setTimeout(getServiceDays, 2000)
        }}
        modalButtonDisabled={modalButtonDisabled}
        setEditAttendanceModalData={setEditAttendanceModalData}
        setUpdatedAttendanceData={setUpdatedAttendanceData}
        titleData={titleData.current}
      />
    </div>
  )
}
