# frozen_string_literal: true

# An individual payment for a child
class Payment < UuidApplicationRecord
  belongs_to :child_approval

  validates :amount, numericality: { greater_than_or_equal_to: 0.00 }, presence: true
  validates :month, presence: true
end

# == Schema Information
#
# Table name: payments
#
#  id                :uuid             not null, primary key
#  amount            :decimal(, )      not null
#  month             :date             not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  child_approval_id :uuid             not null
#
# Indexes
#
#  index_payments_on_child_approval_id  (child_approval_id)
#
# Foreign Keys
#
#  fk_rails_...  (child_approval_id => child_approvals.id)
<<<<<<< HEAD
<<<<<<< HEAD
#
=======
>>>>>>> 93cd2cae (linting fix)
=======
#
>>>>>>> 74445982 (dragonbone81/pie 1642/batch payments (#1764))
