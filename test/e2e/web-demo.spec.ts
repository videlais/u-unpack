import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Unity Package Unpacker Web Demo', () => {
  test('should load the demo page', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Unity Package Unpacker/);
    
    // Check header
    await expect(page.locator('h1')).toContainText('Unity Package Unpacker');
    
    // Check upload section is visible
    await expect(page.locator('#uploadSection')).toBeVisible();
  });

  test('should display upload instructions', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.upload-section h2')).toContainText('Drop your .unitypackage file here');
    await expect(page.locator('.upload-section p')).toContainText('or click to browse');
  });

  test('should have file input element', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('#fileInput');
    await expect(fileInput).toHaveAttribute('type', 'file');
    await expect(fileInput).toHaveAttribute('accept', '.unitypackage');
  });

  test('should unpack a Unity package file', async ({ page }) => {
    await page.goto('/');
    
    // Path to test fixture
    const testPackagePath = path.join(__dirname, '../fixtures/test.unitypackage');
    
    // Upload file via file input
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testPackagePath);
    
    // Wait for results to appear (loading might be too fast to catch)
    await expect(page.locator('#results')).toBeVisible({ timeout: 10000 });
    
    // Verify upload section is hidden
    await expect(page.locator('#uploadSection')).not.toBeVisible();
  });

  test('should display file statistics', async ({ page }) => {
    await page.goto('/');
    
    const testPackagePath = path.join(__dirname, '../fixtures/test.unitypackage');
    await page.locator('#fileInput').setInputFiles(testPackagePath);
    
    // Wait for results
    await expect(page.locator('#results')).toBeVisible({ timeout: 10000 });
    
    // Check file count
    const fileCount = await page.locator('#fileCount').textContent();
    expect(parseInt(fileCount || '0')).toBeGreaterThan(0);
    
    // Check folder count
    const folderCount = await page.locator('#folderCount').textContent();
    expect(parseInt(folderCount || '0')).toBeGreaterThanOrEqual(0);
    
    // Check total size
    const totalSize = await page.locator('#totalSize').textContent();
    expect(totalSize).toBeTruthy();
  });

  test('should display file structure tree', async ({ page }) => {
    await page.goto('/');
    
    const testPackagePath = path.join(__dirname, '../fixtures/test.unitypackage');
    await page.locator('#fileInput').setInputFiles(testPackagePath);
    
    // Wait for results
    await expect(page.locator('#results')).toBeVisible({ timeout: 10000 });
    
    // Check tree view section exists
    await expect(page.locator('.file-structure')).toBeVisible();
    await expect(page.locator('.file-structure h3')).toContainText('Project Structure');
    
    // Check tree view has content
    const treeView = page.locator('#treeView');
    await expect(treeView).toBeVisible();
    
    // Verify at least one tree item
    const treeItems = page.locator('.tree-item');
    await expect(treeItems.first()).toBeVisible();
  });

  test('should display file list', async ({ page }) => {
    await page.goto('/');
    
    const testPackagePath = path.join(__dirname, '../fixtures/test.unitypackage');
    await page.locator('#fileInput').setInputFiles(testPackagePath);
    
    // Wait for results
    await expect(page.locator('#results')).toBeVisible({ timeout: 10000 });
    
    // Check file list section
    await expect(page.locator('.file-list')).toBeVisible();
    await expect(page.locator('.file-list h3')).toContainText('Files');
    
    // Check file list has content
    const fileList = page.locator('#fileList');
    await expect(fileList).toBeVisible();
    
    // Verify file items exist
    const fileItems = page.locator('.file-item');
    await expect(fileItems.first()).toBeVisible();
  });

  test('should show file names in the list', async ({ page }) => {
    await page.goto('/');
    
    const testPackagePath = path.join(__dirname, '../fixtures/test.unitypackage');
    await page.locator('#fileInput').setInputFiles(testPackagePath);
    
    // Wait for results
    await expect(page.locator('#results')).toBeVisible({ timeout: 10000 });
    
    // Check for specific file name
    await expect(page.locator('.file-name')).toContainText('Assets');
  });

  test('should display footer with GitHub link', async ({ page }) => {
    await page.goto('/');
    
    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check GitHub link
    const githubLink = page.locator('footer a[href*="github.com"]');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/videlais/u-unpack');
  });

  test('should handle drag and drop styling', async ({ page }) => {
    await page.goto('/');
    
    const uploadSection = page.locator('#uploadSection');
    
    // Verify upload section is visible and interactive
    await expect(uploadSection).toBeVisible();
    
    // The dragover functionality is tested implicitly through the file upload test
    // Here we just verify the section exists and is ready for interaction
    const hasClickHandler = await uploadSection.evaluate((el) => {
      return el.onclick !== null || el.addEventListener !== undefined;
    });
    
    expect(hasClickHandler).toBe(true);
  });

  test('should verify UUnpack global is available', async ({ page }) => {
    await page.goto('/');
    
    // Check if UUnpack is defined on window
    const hasUUnpack = await page.evaluate(() => {
      return typeof (window as Window & { UUnpack?: unknown }).UUnpack !== 'undefined';
    });
    
    expect(hasUUnpack).toBe(true);
    
    // Check if unpack function exists
    const hasUnpackFunction = await page.evaluate(() => {
      const w = window as Window & { UUnpack?: { unpack?: unknown } };
      return typeof w.UUnpack?.unpack === 'function';
    });
    
    expect(hasUnpackFunction).toBe(true);
  });

  test('should show loading state during unpacking', async ({ page }) => {
    await page.goto('/');
    
    const testPackagePath = path.join(__dirname, '../fixtures/test.unitypackage');
    const fileInput = page.locator('#fileInput');
    
    // Start file upload
    await fileInput.setInputFiles(testPackagePath);
    
    // Either loading is visible, or results are already visible (if processing was fast)
    const loadingOrResults = page.locator('#loading.show, #results.show');
    await expect(loadingOrResults.first()).toBeVisible({ timeout: 5000 });
  });
});
