import React, { useState } from 'react'
import { Checkbox, InputNumber } from 'antd'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

<<<<<<< HEAD
<<<<<<< HEAD
export default function PaymentDataCell({ updateTotalPayment, resetPayment }) {
  const { t } = useTranslation()
  const [isDifferentPayment, setIsDifferentPayment] = useState(false)
  const [paymentValue, setPaymentValue] = useState(undefined)

  const currencyInput = (
    <InputNumber
      className="w-32"
      placeholder={t('enterAmount')}
      formatter={value => inputFormatter(value)}
      parser={value => value.replace(/\$\s?|(,*)/g, '')}
      disabled={!isDifferentPayment}
      min={0}
      value={paymentValue}
      onChange={updatePayment}
    />
  )

  function inputFormatter(value) {
    if (!isDifferentPayment || !value) {
      return t('enterAmount')
    }

    return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  function updatePayment(value) {
    setPaymentValue(value)
    updateTotalPayment(value)
  }

  function resetInput() {
    setPaymentValue(undefined)
  }

  const handleIsDifferentPaymentIsSet = e => {
    const isDifferentPayment = e.target.checked
    setIsDifferentPayment(isDifferentPayment)

    if (!isDifferentPayment) {
      resetPayment()
      resetInput()
    }
  }

  return (
    <div className="flex items-center">
      <Checkbox className="mr-1" onChange={handleIsDifferentPaymentIsSet} />
      <span className="mr-1"> {t('differentAmountFromState')}</span>
      {currencyInput}
=======
export default function PaymentDataCell({ updateTotalPayment, columnIndex }) {
=======
export default function PaymentDataCell({ updateTotalPayment }) {
>>>>>>> f18b2e90 (added logic to sum up total payment)
  const { t } = useTranslation()
  const [isDifferentPayment, setIsDifferentPayment] = useState(false)

  const currencyInput = (
    <InputNumber
      placeholder={t('enterAmount')}
      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={value => value.replace(/\$\s?|(,*)/g, '')}
      disabled={!isDifferentPayment}
      onChange={test}
    />
  )

  function test(value) {
    updateTotalPayment(value)
  }

  const handleIsDifferentPaymentIsSet = e => {
    setIsDifferentPayment(e.target.checked)
  }

  return (
    <div>
      <Checkbox onChange={handleIsDifferentPaymentIsSet} />
      {t('differentAmountFromState')} {currencyInput}
>>>>>>> 210f8692 (added payment input component)
    </div>
  )
}

PaymentDataCell.propTypes = {
<<<<<<< HEAD
  updateTotalPayment: PropTypes.func.isRequired,
<<<<<<< HEAD
  resetPayment: PropTypes.func.isRequired
=======
  columnIndex: PropTypes.number.isRequired
>>>>>>> 210f8692 (added payment input component)
=======
  updateTotalPayment: PropTypes.func.isRequired
>>>>>>> f18b2e90 (added logic to sum up total payment)
}
