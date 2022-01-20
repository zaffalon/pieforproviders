# frozen_string_literal: true

module Api
  module V1
    # API for application users
    class UsersController < Api::V1::ApiController
      before_action :set_user, only: %i[show]
      before_action :authorize_user, only: %i[show]

      # GET /users
      def index
        authorize User

        render json: UserBlueprint.render(
          policy_scope(User.includes(:businesses)),
          view: current_user.state == 'NE' || current_user.admin? ? :nebraska_dashboard : :illinois_dashboard
        )
      end

      # GET /profile or GET /users/:id
      def show
        render json: UserBlueprint.render(
          @user,
          view: @user.state == 'NE' || current_user.admin? ? :nebraska_dashboard : :illinois_dashboard
        )
      end

      private

      def set_user
        @user = params[:id] ? policy_scope(User).find(params[:id]) : current_user
      end

      def authorize_user
        authorize @user
      end
    end
  end
end
