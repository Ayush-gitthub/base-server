require('dotenv').config(); 

const { sign } = require("jsonwebtoken");
const { genSaltSync, hashSync } = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtsalt = process.env.JWT_SALT 
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLIC_ANON_KEY);
const { v4: uuidv4 } = require('uuid');

const getRandomNum = (num = 10000) => { 
    return Math.floor(Math.random() * num);
};

const getRandomArrElem = (arr) => {
    const idx = getRandomNum(arr.length);
    return arr[idx];
};

module.exports = {
    giveToken : (data) => { 
        const {
            userId,
            role
        } = data 
        return sign({
            userId : userId,
            role : role
        }, process.env.JWT_SALT,{
            expiresIn: "1d"
        }); 
    },
    successObj : (result) => {
        return {
            success : 1, 
            result : result 
        }
    },
    errorObj : (err) => {
        return {
            success : 0, 
            error : err 
        }
    },
    hashData : (data) => {
        const salt = genSaltSync(10) 
        let hash = hashSync(data, salt)
        console.log(hash); 
        return hash
    },
    skillExists : (skillArray, skill) => { 
        for(let i = 0; i < skillArray.length; i++){
            if(skillArray.skill === skill) return 1; 
        }
        return 0; 
    },
    removeSkillFromArray : (skillArray, skill) => {
        return skillArray.filter((x) => {
            return x.skill !== skill ;
        })
    },
    decodeToken :  (token, callBack) =>{
        if(!token){
            callBack(null); 
        }
        jwt.verify(token, jwtsalt, (err,decoded)=>{
            console.log(err); 
            if(err){
                callBack(null)
            } else {
                callBack(decoded);
            }
        });
    },
    getFriendIdFromGroupName : (groupName, userId)=>{
        if(!groupName) return null; 
        const arr = groupName.split("-");
        if(arr[0] == userId){
            return arr[1]; 
        } else {
            return arr[0]; 
        }
    },
    uploadFile : async (bucketName, bucketFolder, file, fileExtension) => {
        let fileName = uuidv4(); 
        const uploadPath = `${bucketFolder}/${fileName}.${fileExtension}`; 
        console.log(bucketName, bucketFolder, fileName, uploadPath)
        let res = await supabase.storage
        .from(bucketName)
        .upload(uploadPath, file)
        
        if(res.error){
            return {
                error : res.error 
            }
        }

        const { publicURL, error } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(uploadPath)
        
        if(error){
            return {
                error : error
            }
        }
        
        return {
            data : res.data, 
            publicURL : publicURL 
        }
    },
    getRandomIdFromModel: async (model, filter = {}) => {
        let all = await model.find(filter);
        all = all.map((item) => item._id);
        const id = getRandomArrElem(all);
        return id;
    },
    getRandomNum,
    getRandomArrElem
}