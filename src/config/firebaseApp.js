import * as firebase from 'firebase/app'
import Config from './fbconfig'
const App = firebase.initializeApp(Config)
export default App;