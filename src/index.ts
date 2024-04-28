import 'dotenv/config';
import connectDB from './db/index';
import app from './app'

connectDB().then(()=>{
    app.listen(3000)
}).catch(()=>{

})
