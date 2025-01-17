# frozen_string_literal: true

# The businesses for which users are responsible for keeping subsidy data
class ServiceDay < UuidApplicationRecord
  # if a schedule is deleted this field will be nullified, which doesn't trigger the callback in Schedule
  # to recalculate all service days total_time_in_care; this handles that use case
  after_save_commit :calculate_service_day

  belongs_to :child
  belongs_to :schedule, optional: true
  has_many :attendances, dependent: :destroy
  has_many :child_approvals, -> { distinct }, through: :attendances

  attribute :total_time_in_care, :interval

  monetize :earned_revenue_cents, allow_nil: true

  ABSENCE_TYPES = %w[
    absence
    covid_absence
  ].freeze

  validates :absence_type, inclusion: { in: ABSENCE_TYPES }, allow_nil: true
  validates :date, date_time_param: true, presence: true
  validate :prevent_creation_of_absence_without_schedule

  delegate :business, to: :child
  delegate :state, to: :child

  scope :absences, -> { where.not(absence_type: nil) }
  scope :non_absences, -> { where(absence_type: nil) }
  scope :covid_absences, -> { where(absence_type: 'covid_absence') }
  scope :standard_absences, -> { where(absence_type: 'absence') }

  scope :for_month,
        lambda { |month = nil|
          month ||= Time.current
          where('date BETWEEN ? AND ?', month.at_beginning_of_month, month.at_end_of_month)
        }
  scope :for_week,
        lambda { |week = nil|
          week ||= Time.current
          where('date BETWEEN ? AND ?', week.at_beginning_of_week(:sunday), week.at_end_of_week(:sunday))
        }
  scope :for_day,
        lambda { |day = nil|
          day ||= Time.current
          where('date BETWEEN ? AND ?', day.at_beginning_of_day, day.at_end_of_day)
        }
  scope :for_weekday,
        lambda { |weekday|
          where("select date_part('dow', DATE(date)) = ?", weekday)
        }

  scope :for_period,
        lambda { |start_time = nil, end_time = nil|
          start_time ||= Time.current
          end_time ||= Time.current
          where(date: start_time.at_beginning_of_day..end_time.at_end_of_day)
        }

  scope :with_attendances, -> { includes(:attendances) }

  def absence?
    absence_type.present?
  end

  def prevent_creation_of_absence_without_schedule
    return unless absence?

    errors.add(:absence_type, "can't create for a day without a schedule") unless schedule_for_weekday
  end

  def schedule_for_weekday
    child.schedules.active_on(date).for_weekday(date.wday).first
  end

  # TODO: extract tags to a service object
  def tags
    [tag_hourly, tag_daily, tag_absence].compact
  end

  def tag_hourly
    return unless state == 'NE'

    hourly? || daily_plus_hourly? || daily_plus_hourly_max? ? "#{tag_hourly_amount} hourly" : nil
  end

  def tag_daily
    return unless state == 'NE'

    daily? || daily_plus_hourly? || daily_plus_hourly_max? ? "#{tag_daily_amount} daily" : nil
  end

  def tag_hourly_amount
    a = Nebraska::Daily::HoursDurationCalculator.new(total_time_in_care: total_time_in_care).call
    a.to_i == a ? a.to_i.to_s : a.to_s
  end

  def tag_daily_amount
    Nebraska::Daily::DaysDurationCalculator.new(total_time_in_care: total_time_in_care).call&.to_s
  end

  def tag_absence
    return unless state == 'NE'

    absence? ? 'absence' : nil
  end

  def hourly?
    return false unless state == 'NE' && total_time_in_care

    total_time_in_care <= (5.hours + 45.minutes)
  end

  def daily?
    return false unless state == 'NE' && total_time_in_care

    total_time_in_care > (5.hours + 45.minutes) && total_time_in_care <= 10.hours
  end

  def daily_plus_hourly?
    return false unless state == 'NE' && total_time_in_care

    total_time_in_care > 10.hours && total_time_in_care <= 18.hours
  end

  def daily_plus_hourly_max?
    return false unless state == 'NE' && total_time_in_care

    total_time_in_care > 18.hours
  end

  def calculate_service_day
    return unless previously_new_record? ||
                  saved_change_to_schedule_id?(to: nil) ||
                  saved_change_to_absence_type

    ServiceDayCalculatorJob.perform_later(self)
  end
end
# == Schema Information
#
# Table name: service_days
#
#  id                      :uuid             not null, primary key
#  absence_type            :string
#  date                    :datetime         not null
#  earned_revenue_cents    :integer
#  earned_revenue_currency :string           default("USD"), not null
#  total_time_in_care      :interval
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  child_id                :uuid             not null
#  schedule_id             :uuid
#
# Indexes
#
#  index_service_days_on_child_id     (child_id)
#  index_service_days_on_date         (date)
#  index_service_days_on_schedule_id  (schedule_id)
#
# Foreign Keys
#
#  fk_rails_...  (child_id => children.id)
#  fk_rails_...  (schedule_id => schedules.id)
#
