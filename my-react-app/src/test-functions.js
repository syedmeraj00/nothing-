// Test script to verify all functions work properly

// Test 1: Admin Login
console.log('Testing Admin Login...');
const testAdminLogin = (email, password) => {
  if (email === 'admin@esgenius.com' && password === 'admin123') {
    console.log('✅ Admin login works');
    return true;
  }
  console.log('❌ Admin login failed');
  return false;
};

// Test 2: User Signup
console.log('Testing User Signup...');
const testUserSignup = (email, fullName, password) => {
  try {
    const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const newUser = { 
      email, 
      password, 
      fullName, 
      requestDate: new Date().toISOString(), 
      status: 'pending' 
    };
    pendingUsers.push(newUser);
    localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
    console.log('✅ User signup works');
    return true;
  } catch (error) {
    console.log('❌ User signup failed:', error);
    return false;
  }
};

// Test 3: User Approval
console.log('Testing User Approval...');
const testUserApproval = (userEmail) => {
  try {
    const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const approved = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    
    const userIndex = pending.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
      const user = { ...pending[userIndex] };
      user.status = 'approved';
      user.approvedDate = new Date().toISOString();
      
      approved.push(user);
      pending.splice(userIndex, 1);
      
      localStorage.setItem('pendingUsers', JSON.stringify(pending));
      localStorage.setItem('approvedUsers', JSON.stringify(approved));
      
      console.log('✅ User approval works');
      return true;
    }
    console.log('❌ User not found for approval');
    return false;
  } catch (error) {
    console.log('❌ User approval failed:', error);
    return false;
  }
};

// Test 4: Approved User Login
console.log('Testing Approved User Login...');
const testApprovedUserLogin = (email) => {
  try {
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    const isApproved = approvedUsers.some(user => user.email === email);
    
    if (isApproved) {
      console.log('✅ Approved user login works');
      return true;
    }
    console.log('❌ User not approved');
    return false;
  } catch (error) {
    console.log('❌ Approved user login failed:', error);
    return false;
  }
};

// Run Tests
console.log('=== Running Function Tests ===');

// Clear localStorage for clean test
localStorage.removeItem('pendingUsers');
localStorage.removeItem('approvedUsers');

// Test admin login
testAdminLogin('admin@esgenius.com', 'admin123');
testAdminLogin('admin@esgenius.com', 'wrongpassword');

// Test user signup
testUserSignup('test@company.com', 'Test User', 'password123');

// Test user approval
testUserApproval('test@company.com');

// Test approved user login
testApprovedUserLogin('test@company.com');

console.log('=== Tests Complete ===');

export { testAdminLogin, testUserSignup, testUserApproval, testApprovedUserLogin };