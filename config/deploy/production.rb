set :branch, 'master'

role :app, %w{rnitta@tk2-403-42673.vs.sakura.ne.jp}
role :web, %w{rnitta@tk2-403-42673.vs.sakura.ne.jp}
role :db,  %w{rnitta@tk2-403-42673.vs.sakura.ne.jp}

server 'tk2-403-42673.vs.sakura.ne.jp', user: 'rnitta', roles: %w{web app db}

set :ssh_options, {
    forward_agent: true,
    auth_methods: %w(publickey),
    port: 2222
}
