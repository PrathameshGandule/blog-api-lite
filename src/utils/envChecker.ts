import { configDotenv } from "dotenv"
configDotenv();

// this function checks if all necessary environment varialbles exists in .env
const checkEnvs = (): void => {
    if(!process.env.ANONYMOUS_USER_ID) { 
        console.log("Please specify the ANONYMOUS_USER_ID secret")
        process.exit(1);
    };
    if(!process.env.MONGO_URI) { 
        console.log("Please specify the MONGO_URI secret")
        process.exit(1);
    };
    if(!process.env.JWT_SECRET) { 
        console.log("Please specify the JWT_SECRET secret")
        process.exit(1);
    };
    if(!process.env.REDIS_URL) { 
        console.log("Please specify the REDIS_URL secret")
        process.exit(1);
    };
    if(!process.env.USER_EMAIL) { 
        console.log("Please specify the USER_EMAIL secret")
        process.exit(1);
    };
    if(!process.env.APP_PASS) { 
        console.log("Please specify the APP_PASS secret")
        process.exit(1);
    };
}

export default checkEnvs;