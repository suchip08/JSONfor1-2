package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.DepartmentDto;
import com.example.demo.entity.Department;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DepartmentRepository;

@Service
public class DepartmentService {

    private static final Logger log = LoggerFactory.getLogger(DepartmentService.class);

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    // Get all departments
    @Transactional(readOnly = true)
    public Page<DepartmentDto> getAllDepartments(Pageable pageable) {
        log.info("Fetching all departments with pagination: {}", pageable);
        return departmentRepository.findAll(pageable)
                .map(this::toDto);
    }

    // Get department by ID
    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        log.info("Fetching department with id: {}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return toDto(department);
    }

    // Create department
    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        log.info("Creating new department with name: {}", dto.getName());
        Department department = toEntity(dto);
        Department saved = departmentRepository.save(department);
        return toDto(saved);
    }

    // Update department
    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        log.info("Updating department with id: {}", id);
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());

        Department updated = departmentRepository.save(existing);
        return toDto(updated);
    }

    // Delete department
    @Transactional
    public void deleteDepartment(Long id) {
        log.info("Deleting department with id: {}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        departmentRepository.delete(department);
    }

    // ---------- Conversion Methods ----------

    private DepartmentDto toDto(Department department) {
        return new DepartmentDto(
                department.getId(),
                department.getName(),
                department.getDescription()
        );
    }

    private Department toEntity(DepartmentDto dto) {
        Department department = new Department();
        department.setName(dto.getName());
        department.setDescription(dto.getDescription());
        return department;
    }
}
