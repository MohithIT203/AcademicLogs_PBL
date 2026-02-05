const StudentService = require("../services/student.service");

// Get periodic test scores for a student
const getPtscores = async(req, res) => {
    const studentId = req.user.id; //for testing
    try{
        const ptScores = await StudentService.getptScores(studentId);
        res.status(200).json({
            message:"Successfully retrieved periodic test scores",
            data: ptScores
        });
    } catch(err){
        res.status(500).json({ 
            message: "Error retrieving periodic test scores",
            error: err.message 
        });
    }
}

// Get semester scores for a student
const getsemesterscores = async(req, res) => {
    const studentId = req.user.id; //for testing
    try{
        const SemScores = await StudentService.getSemesterScores(studentId);
        res.status(200).json({
            message:"Successfully retrieved semester scores",
            data: SemScores
        });
    } catch(err){
        res.status(500).json({ 
            message: "Error retrieving semester scores",
            error: err.message 
        });
    }
}
// const getuserAttendance = async(req,res)=>{
//     const id = req.
// }

module.exports = { getPtscores, getsemesterscores };