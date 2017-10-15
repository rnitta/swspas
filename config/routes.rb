Rails.application.routes.draw do
  get '/' , to: 'static_pages#index'
  get '/sp/:pid' , to: 'static_pages#sp'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
