# frozen_string_literal: true

# An individual child on a family's approval letter
class ChildApproval < UuidApplicationRecord
  after_create_commit :create_default_schedule, unless: proc { |child_approval| child_approval.child.schedules.present? }

  belongs_to :child
  belongs_to :approval
  belongs_to :rate, polymorphic: true, optional: true
  has_many :illinois_approval_amounts, dependent: :destroy
  has_many :nebraska_approval_amounts, dependent: :destroy
  has_many :attendances, dependent: :destroy
  has_many :service_days, -> { distinct }, through: :attendances

  delegate :user, to: :child
  delegate :business, to: :child
  delegate :case_number, to: :approval

  validates :effective_on, presence: true
  validates :expires_on, presence: true

  accepts_nested_attributes_for :nebraska_approval_amounts, :approval

  scope :with_approval, -> { includes(:approval) }

  def special_needs_daily_rate
    Money.from_amount(super) if super
  end

  def special_needs_hourly_rate
    Money.from_amount(super) if super
  end

  def create_default_schedule
    # this will run for Mon (1) - Fri (5)
    5.times do |idx|
      Schedule.create!(
        child: child,
        weekday: idx + 1,
        duration: 28_800, # seconds in 8 hours
        effective_on: effective_on
      )
    end
  end
end

# == Schema Information
#
# Table name: child_approvals
#
#  id                        :uuid             not null, primary key
#  authorized_weekly_hours   :decimal(5, 2)
#  deleted_at                :date
#  effective_on              :date             not null
#  enrolled_in_school        :boolean
#  expires_on                :date             not null
#  full_days                 :integer
#  hours                     :decimal(, )
#  rate_type                 :string
#  special_needs_daily_rate  :decimal(, )
#  special_needs_hourly_rate :decimal(, )
#  special_needs_rate        :boolean
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  approval_id               :uuid             not null
#  child_id                  :uuid             not null
#  rate_id                   :uuid
#
# Indexes
#
#  index_child_approvals_on_approval_id  (approval_id)
#  index_child_approvals_on_child_id     (child_id)
#  index_child_approvals_on_rate         (rate_type,rate_id)
#
# Foreign Keys
#
#  fk_rails_...  (approval_id => approvals.id)
#  fk_rails_...  (child_id => children.id)
#
