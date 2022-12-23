/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the new bill form should be display", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      expect(screen.getByTestId("form-new-bill")).toBeInTheDocument();
    });
  });
});
