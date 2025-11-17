package org.example.test_aws.service;

import org.example.test_aws.model.Student;
import org.example.test_aws.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StudentService {
    
    @Autowired
    private StudentRepository studentRepository;
    
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
    
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }
    
    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }
    
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        
        student.setFirstName(studentDetails.getFirstName());
        student.setLastName(studentDetails.getLastName());
        student.setEmail(studentDetails.getEmail());
        student.setDateOfBirth(studentDetails.getDateOfBirth());
        student.setField(studentDetails.getField());
        student.setYear(studentDetails.getYear());
        student.setPhoneNumber(studentDetails.getPhoneNumber());
        student.setAddress(studentDetails.getAddress());
        
        return studentRepository.save(student);
    }
    
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        studentRepository.delete(student);
    }
    
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Nombre total d'étudiants
        Long total = studentRepository.count();
        stats.put("total", total != null ? total : 0L);
        
        // Nombre par filière
        List<Object[]> byField = studentRepository.countByField();
        Map<String, Long> fieldStats = new HashMap<>();
        for (Object[] result : byField) {
            String field = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            fieldStats.put(field, count);
        }
        stats.put("byField", fieldStats);
        
        // Nombre par année
        List<Object[]> byYear = studentRepository.countByYear();
        Map<String, Long> yearStats = new HashMap<>();
        for (Object[] result : byYear) {
            Integer year = (Integer) result[0];
            Long count = ((Number) result[1]).longValue();
            yearStats.put("Année " + year, count);
        }
        stats.put("byYear", yearStats);
        
        // Âge moyen
        Double avgAge = studentRepository.getAverageAge();
        stats.put("averageAge", avgAge != null ? Math.round(avgAge * 10.0) / 10.0 : 0.0);
        
        // Répartition par âge
        Map<String, Long> ageStats = new HashMap<>();
        Long age18_20 = studentRepository.countByAgeRange18_20();
        Long age21_23 = studentRepository.countByAgeRange21_23();
        Long age24Plus = studentRepository.countByAgeRange24Plus();
        ageStats.put("18-20 ans", age18_20 != null ? age18_20 : 0L);
        ageStats.put("21-23 ans", age21_23 != null ? age21_23 : 0L);
        ageStats.put("24+ ans", age24Plus != null ? age24Plus : 0L);
        stats.put("byAge", ageStats);
        
        return stats;
    }
}

