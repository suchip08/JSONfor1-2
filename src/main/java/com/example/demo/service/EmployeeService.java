package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.EmployeeDto;
import com.example.demo.entity.Department;
import com.example.demo.entity.Employee;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EmployeeRepository;

@Service
public class EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    // Get all employees
    @Transactional(readOnly = true)
    public Page<EmployeeDto> getAllEmployees(Pageable pageable) {
        log.info("Fetching all employees with pagination: {}", pageable);
        return employeeRepository.findAll(pageable)
                .map(this::toDto);
    }

    // Get employee by ID
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(Long id) {
        log.info("Fetching employee with id: {}", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return toDto(employee);
    }

    // Get employees by department
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByDepartment(Long departmentId) {
        log.info("Fetching employees for department id: {}", departmentId);
        return employeeRepository.findByDepartmentId(departmentId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Search employees by keyword
    @Transactional(readOnly = true)
    public Page<EmployeeDto> searchEmployees(String keyword, Pageable pageable) {
        log.info("Searching employees with keyword '{}' and pagination: {}", keyword, pageable);
        return employeeRepository.searchByKeyword(keyword, pageable)
                .map(this::toDto);
    }

    // Create employee
    @Transactional
    public EmployeeDto createEmployee(EmployeeDto dto) {
        log.info("Creating new employee with email: {}", dto.getEmail());
        Employee employee = toEntity(dto);
        Employee saved = employeeRepository.save(employee);
        return toDto(saved);
    }

    // Update employee
    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeDto dto) {
        log.info("Updating employee with id: {}", id);
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setDesignation(dto.getDesignation());
        existing.setSalary(dto.getSalary());
        existing.setJoiningDate(dto.getJoiningDate());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department not found with id: " + dto.getDepartmentId()));
            existing.setDepartment(department);
        }

        Employee updated = employeeRepository.save(existing);
        return toDto(updated);
    }

    // Delete employee
    @Transactional
    public void deleteEmployee(Long id) {
        log.info("Deleting employee with id: {}", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employeeRepository.delete(employee);
    }

    // ---------- Conversion Methods ----------

    private EmployeeDto toDto(Employee employee) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setDesignation(employee.getDesignation());
        dto.setSalary(employee.getSalary());
        dto.setJoiningDate(employee.getJoiningDate());

        if (employee.getDepartment() != null) {
            dto.setDepartmentId(employee.getDepartment().getId());
            dto.setDepartmentName(employee.getDepartment().getName());
        }

        return dto;
    }

    private Employee toEntity(EmployeeDto dto) {
        Employee employee = new Employee();
        employee.setName(dto.getName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setDesignation(dto.getDesignation());
        employee.setSalary(dto.getSalary());
        employee.setJoiningDate(dto.getJoiningDate());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department not found with id: " + dto.getDepartmentId()));
            employee.setDepartment(department);
        }

        return employee;
    }
}
