<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
<<<<<<< HEAD
<<<<<<< HEAD
import { Alert, Table, Tooltip } from 'antd'
import PaymentDataCell from './paymentDataCell'
import PropTypes from 'prop-types'
import '_assets/styles/payment-table-overrides.css'
import pieSliceLogo from '../_assets/pieSliceLogo.svg'

export function PaymentModal({
  setTotalPayment,
  lastMonth,
  childPayments,
  setChildPayments,
  isFailedPaymentRequest
}) {
  const { cases } = useSelector(state => state)
  const { t } = useTranslation()
  const [currentChildID, setCurrentChildID] = useState(false)
  const [originalPayments, setOriginalPayments] = useState({})

  useEffect(() => {
    initChildPayments()
  }, [])

  useEffect(() => {
    calculateTotalPayments()
  }, [childPayments])

  function initChildPayments() {
    let payments = {}

    cases.forEach(child => {
      payments[child.id] = child.earnedRevenue
      originalPayments[child.id] = child.earnedRevenue
    })

    setChildPayments(payments)
    setOriginalPayments(payments)
  }

  function calculateTotalPayments() {
    const updatedTotal = Object.values(childPayments).reduce((a, b) => a + b, 0)
    setTotalPayment(updatedTotal)
  }

  function updateCurrentRowIndex(childID) {
    setCurrentChildID(childID)
  }

  function updateTotalPayment(value) {
    setChildPayments({ ...childPayments, [currentChildID]: value })
  }

  function resetPayment() {
    updateTotalPayment(originalPayments[currentChildID])
  }

  const earnedRevenueHeader = (
    <div>
      {t('earnedRevenue')}
      <div>
        <Tooltip title={t('pieForProvidersHasCalculated')}>
          <span className="calculated-by-text">
            {t('calculatedBy')} Pie
            <img
              alt={t('pieforProvidersLogoAltText')}
              src={pieSliceLogo}
              className="w-5 pie-logo-inline"
            />
          </span>
        </Tooltip>
      </div>
    </div>
  )

  const columns = [
    {
      title: t('childName'),
      render: childCase => {
        return (
          <div className="payment-table-text">{childCase.child.childName}</div>
        )
      }
    },
    {
      title: earnedRevenueHeader,
      render: childCase => {
        return (
          <div className="payment-table-text">${childCase.earnedRevenue}</div>
        )
      }
    },
    {
      title: updatePaymentHeader,
      render: () => (
        <PaymentDataCell
          updateTotalPayment={updateTotalPayment}
          resetPayment={resetPayment}
        />
      )
    }
  ]

  function updatePaymentHeader() {
    return (
      <div>
        {t('updatePayment')} ({t('differentPaymentAmount')})
      </div>
    )
  }

  const table = (
    <Table
      id="payment-table"
      bordered={false}
      columns={columns}
      dataSource={cases}
      rowClassName="payment-row"
      pagination={{ hideOnSinglePage: true }}
      onRow={childCase => {
        return {
          onMouseEnter: event => {
            updateCurrentRowIndex(childCase.id)
          }
        }
      }}
    />
  )

  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec'
  ]

  const previousMonth = monthNames[lastMonth.getMonth()]
  const previousMonthYear = lastMonth.getFullYear()

  return (
    <div>
      <p className="mb-4 body-1">{t('recordAChildsPayment')}</p>

      {isFailedPaymentRequest ? (
        <Alert
          className="mb-3"
          message={
            <span className="text-base text-gray1">{t('paymentFailed')}</span>
          }
          type="error"
          closable={true}
        />
      ) : (
        <></>
      )}

      <div className="mb-2 eyebrow-small">{t('step1')}</div>
      <p className="mb-2 body-1">{t('choosePaymentMonth')}</p>

      <div className="ml-4">
        {t(previousMonth)} {previousMonthYear}
      </div>

      <div className="mt-4 mb-2 eyebrow-small">{t('step2')}</div>
      <p className="mb-4 body-1">{t('childrenPayment')}</p>
      {table}
    </div>
  )
}

PaymentModal.propTypes = {
  setTotalPayment: PropTypes.func.isRequired,
  lastMonth: PropTypes.instanceOf(Date).isRequired,
  childPayments: PropTypes.object.isRequired,
  setChildPayments: PropTypes.func.isRequired,
  isFailedPaymentRequest: PropTypes.bool.isRequired
}
=======
import React from 'react'
=======
import React, { useState } from 'react'
>>>>>>> 210f8692 (added payment input component)
=======
import React, { useEffect, useState } from 'react'
>>>>>>> f18b2e90 (added logic to sum up total payment)
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Table } from 'antd'
=======
import { Table, Dropdown, Menu } from 'antd'
=======
import { Table, Dropdown, Menu, Tooltip } from 'antd'
>>>>>>> 8e6eff56 (css changes and tooltip)
import { DownOutlined } from '@ant-design/icons'
>>>>>>> f2cd5fa8 (Adding payment month dropdown)
import PaymentDataCell from './paymentDataCell'
import PropTypes from 'prop-types'
import '_assets/styles/payment-table-overrides.css'
import pieSliceLogo from '../_assets/pieSliceLogo.svg'

export function PaymentModal({
  setTotalPayment,
  lastMonth,
  childPayments,
  setChildPayments
}) {
  const { cases } = useSelector(state => state)
  const { t } = useTranslation()
  const [currentChildID, setCurrentChildID] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    initChildPayments()
  }, [])

  useEffect(() => {
    calculateTotalPayments()
  }, [childPayments])

  function initChildPayments() {
    let payments = {}

    cases.forEach(child => {
      payments[child.id] = child.guaranteedRevenue
    })
    setChildPayments(payments)
  }

  function calculateTotalPayments() {
    const updatedTotal = Object.values(childPayments).reduce((a, b) => a + b, 0)
    setTotalPayment(updatedTotal)
  }

  function updateCurrentRowIndex(childID) {
    setCurrentChildID(childID)
  }

  function updateTotalPayment(value) {
    setChildPayments({ ...childPayments, [currentChildID]: value })
  }

  const earnedRevenueHeader = (
    <div>
      {t('earnedRevenue')}
      <div>
        <Tooltip title={t('pieForProvidersHasCalculated')}>
          <span className="calculated-by-text">
            {t('calculatedBy')} Pie
            <img
              alt={t('pieforProvidersLogoAltText')}
              src={pieSliceLogo}
              className="w-5 pie-logo-inline"
            />
          </span>
        </Tooltip>
      </div>
    </div>
  )

  const columns = [
    {
      title: t('childName'),
      render: childCase => {
        return <div className="payment-table-text"> {childCase.childName} </div>
      }
    },
    {
      title: earnedRevenueHeader,
      render: childCase => {
        return (
          <div className="payment-table-text">
            ${childCase.guaranteedRevenue}
          </div>
        )
      }
    },
    {
      title: updatePaymentHeader,
      render: () => {
        return <PaymentDataCell updateTotalPayment={updateTotalPayment} />
      }
    }
  ]

  function updatePaymentHeader() {
    return (
      <div>
        {t('updatePayment')} ({t('differentPaymentAmount')})
      </div>
    )
  }

  const table = (
    <Table
      id="payment-table"
      bordered={false}
      columns={columns}
      dataSource={cases}
      rowClassName="payment-row"
      pagination={{ hideOnSinglePage: true }}
      onRow={childCase => {
        return {
          onMouseEnter: event => {
            updateCurrentRowIndex(childCase.id)
          }
        }
      }}
    />
  )

  function handleMenuClick() {
    setVisible(false)
  }

  function handleVisibleChange(flag) {
    setVisible(flag)
  }
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec'
  ]

  const previousMonth = monthNames[lastMonth.getMonth()]
  const previousMonthYear = lastMonth.getFullYear()

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">
        {t(previousMonth)} {previousMonthYear}
      </Menu.Item>
    </Menu>
  )

  return (
    <div>
      <p className="mb-4">{t('recordAChildsPayment')}</p>
      <h3 className="mb-2">{t('step1')}</h3>
      <p className="mb-2">{t('choosePaymentMonth')}</p>
      <Dropdown
        overlay={menu}
        onVisibleChange={handleVisibleChange}
        visible={visible}
        className="ml-2"
      >
        <a href={() => false} onClick={e => e.preventDefault()}>
          <span className="mr-1">
            {t(previousMonth)} {previousMonthYear}
          </span>
          <DownOutlined />
        </a>
      </Dropdown>
      <h3 className="mt-4 mb-2">{t('step2')}</h3>
      <p className="mb-4">{t('childrenPayment')}</p>
      {table}
    </div>
  )
}
<<<<<<< HEAD
>>>>>>> d58eccab (Added record payment modal (#1705))
=======

PaymentModal.propTypes = {
  setTotalPayment: PropTypes.func.isRequired,
  lastMonth: PropTypes.instanceOf(Date).isRequired,
  childPayments: PropTypes.array.isRequired,
  setChildPayments: PropTypes.func.isRequired
}
>>>>>>> f18b2e90 (added logic to sum up total payment)
