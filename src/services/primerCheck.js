import axios from 'axios'


const baseURL = 'http://localhost:3001/persons'

const checkFile = (file) => {
    return axios.post(`${baseURL}/check_primers`, file)
}

const checkFiles = (files) => {
    return axios.post(`${baseURL}/check_primers`, file)
}

export default { checkFile, checkFiles }