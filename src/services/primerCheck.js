import axios from "axios";

// const baseURL =
//   "https://mendel2.bii.a-star.edu.sg/METHODS/corona/gamma/cgi-bin/cgi_scripts/primerMVP.py";
const baseURL = "http://localhost:3001";

const checkFile = (file) => {
  return axios.post(`${baseURL}`, file);
};

const checkFiles = (files) => {
  const to_send = { data: files };
  // return axios.post(`${baseURL}`, to_send);
  return axios.post(`${baseURL}/check_primers`, to_send);
};

export default { checkFile, checkFiles };
