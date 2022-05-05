class AddNullFalseToChildApprovals < ActiveRecord::Migration[6.1]
  def up
    change_column_null :child_approvals, :effective_on, false
    change_column_null :child_approvals, :expires_on, false
  end

  def down
    change_column_null :child_approvals, :effective_on, true
    change_column_null :child_approvals, :expires_on, true
  end
end
