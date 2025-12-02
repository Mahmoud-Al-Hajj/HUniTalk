import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;
const token = localStorage.getItem("token");

window.Echo = new Echo({
  broadcaster: "pusher",
  key: process.env.REACT_APP_PUSHER_APP_KEY,
  cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint: "/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
});

export default window.Echo;
