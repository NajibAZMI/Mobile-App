package org.example.test_aws.repository;

import org.example.test_aws.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByField(String field);
    List<Student> findByYear(Integer year);
    
    @Query("SELECT s.field, COUNT(s) FROM Student s GROUP BY s.field")
    List<Object[]> countByField();
    
    @Query("SELECT s.year, COUNT(s) FROM Student s GROUP BY s.year")
    List<Object[]> countByYear();
    
    @Query("SELECT AVG(TIMESTAMPDIFF(YEAR, s.dateOfBirth, CURDATE())) FROM Student s")
    Double getAverageAge();
    
    @Query("SELECT COUNT(s) FROM Student s WHERE TIMESTAMPDIFF(YEAR, s.dateOfBirth, CURDATE()) BETWEEN 18 AND 20")
    Long countByAgeRange18_20();
    
    @Query("SELECT COUNT(s) FROM Student s WHERE TIMESTAMPDIFF(YEAR, s.dateOfBirth, CURDATE()) BETWEEN 21 AND 23")
    Long countByAgeRange21_23();
    
    @Query("SELECT COUNT(s) FROM Student s WHERE TIMESTAMPDIFF(YEAR, s.dateOfBirth, CURDATE()) >= 24")
    Long countByAgeRange24Plus();
}

