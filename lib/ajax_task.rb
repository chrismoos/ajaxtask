require 'digest/sha2'

module AjaxTask
  
  def self.included(cls)
    cls.extend(ClassMethods)
  end
  
  module ClassMethods
    #
    # Defines the action used for handling ajax tasks
    #
    def ajaxtask_handler(handler)
      ajaxtask_status
      define_method handler do
        render :text => "no_task" and return if not self.respond_to?("ajaxtask_#{params[:task]}".to_sym, true)
        
        session[:ajaxtask] = {} if not session[:ajaxtask]
        method = "ajaxtask_#{params[:task]}".to_sym
        
        # start the task
        if not params[:uuid]
          uuid = send(method, :start => '')
          clientUuid = Digest::SHA2.hexdigest(ActiveSupport::SecureRandom.base64(8) + uuid)
          session[:ajaxtask][clientUuid] = uuid
          render :json => {:status => :ok, :data => clientUuid}
        else #task status
          render :json => {:status => :error, :data => :invalid} and return if not session[:ajaxtask].has_key? params[:uuid]
          uuid = session[:ajaxtask][params[:uuid]]
          response = send(method, :status => uuid)
          if response[:status] == :done
            session[:ajaxtask].delete(params[:uuid])
          end
          render :json => response
        end
        
      end
    end
    
    # Defines a task 
    def ajaxtask(name)
      define_method "ajaxtask_#{name}".to_sym do |action|
        if action.has_key? :start
          send("#{name}_start".to_sym)
        elsif action.has_key? :status
          ajaxtask_status(name, action[:status])
        else
          {:status => :error, :data => :unknown_error}
        end
      end
    end
    
    def ajaxtask_status
      define_method :ajaxtask_status do |name, uuid|
        response = send("#{name}_status".to_sym, uuid)
        if response.has_key? :pending
          {:status => :pending, :data => response[:pending]}
        elsif response.has_key? :error
          {:status => :error, :data => response[:error]}
        elsif response.has_key? :done
          {:status => :done, :data => response[:done]}
        else
          {:status => :pending}
        end
      end
    end
  end
end