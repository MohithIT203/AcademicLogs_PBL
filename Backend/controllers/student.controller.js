const StudentService = require("../services/student.service");
const CourseService =require("../services/faculty.service");
// const { getStudentCourses } = require(".../ser");


const getPtscores = async(req, res) => {
    const studentId = req.params.id; 
    
    if (!studentId) {
        return res.status(400).json({ 
            message: "Student ID is required",
            error: "ID parameter missing" 
        });
    }
    
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
    const studentId = req.params.id;
    
    if (!studentId) {
        return res.status(400).json({ 
            message: "Student ID is required",
            error: "ID parameter missing" 
        });
    }
    
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

// get user attendance
const getAttendance = async(req, res) => {
    const studentId = req.params.id; // Changed from destructuring
    
    if (!studentId) {
        return res.status(400).json({ 
            message: "Student ID is required",
            error: "ID parameter missing" 
        });
    }
    
    try{
        const attendance = await StudentService.getAttendance(studentId);
        res.status(200).json({
            message:"Successfully retrieved attendance",
            data: attendance
        });
    } catch(err){
        res.status(500).json({ 
            message: "Error retrieving attendance",
            error: err.message 
        });
    }
}
const fetchStudentCourses = async (req, res) => {
  try {
   
    const userId = req.user?.id;
 
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
 
    const result = await StudentService.getStudentCourses(userId);
 
    if (!result.success) {
      return res.status(404).json(result);
    }
 
    return res.status(200).json(result);
 
  } catch (err) {
    console.error("fetchStudentCourses error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
 
// const getCourses = async (req, res) => {
//   try {
//     const result = await CourseService.allCourses();
//     res.status(200).json({ message: "Success", data: result.courses });
//   } catch (err) {
//     res.status(500).json({ message: "Error retrieving courses", error: err.message });
//   }
// };

module.exports = { getPtscores, getsemesterscores, getAttendance, fetchStudentCourses };