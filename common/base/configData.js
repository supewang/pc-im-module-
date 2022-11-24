const configData = {
  message_seq: {
    save(val) {
      localStorage.setItem("message_seq", val);
    },
    get() {
      try {
        const data = Number(localStorage.getItem("message_seq"));
        return data;
      } catch (error) {
        console.error("localStorage.getItem=>message_seq", error);
        return 0;
      }
    },
    clear() {
      try {
        localStorage.removeItem("message_seq");
        return true;
      } catch (error) {
        console.error("localStorage.clear=>message_seq", error);
        return false;
      }
    },
  },
};
export default configData;
