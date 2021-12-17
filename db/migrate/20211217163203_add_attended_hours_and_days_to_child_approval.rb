class AddAttendedHoursAndDaysToChildApproval < ActiveRecord::Migration[6.1]
  def change
    add_column :child_approvals, :attended_hours, :decimal
    add_column :child_approvals, :attended_days, :integer
  end
end
