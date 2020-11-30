import axios from "axios";

const baseURL =
  "https://mendel3.bii.a-star.edu.sg/METHODS/corona/gamma/cgi-bin/cgi_scripts/primerMVP.py";
// const baseURL = "http://localhost:3001";

const checkFile = (file) => {
  return axios.post(`${baseURL}`, file);
};

const checkFiles = (files) => {
  return axios.post(`${baseURL}`, files);
  // return axios.post(`${baseURL}/check_primers`, files);
};

export default { checkFile, checkFiles };
