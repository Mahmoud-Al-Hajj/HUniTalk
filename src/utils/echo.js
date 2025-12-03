import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: "pusher",
  key: process.env.REACT_APP_PUSHER_APP_KEY,
  cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint:
    "https://hunitalk-production.up.railway.app/api/broadcasting/auth",
  auth: {
    headers: {
      get Authorization() {
        const token = localStorage.getItem("token");
        return `Bearer ${token}`;
      },
    },
  },
});

export default window.Echo;
