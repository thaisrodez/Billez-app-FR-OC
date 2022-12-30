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
      // form with all inputs should be in the DOM
      expect(screen.getByTestId("form-new-bill")).toBeInTheDocument();
      expect(screen.getByTestId("expense-type")).toBeInTheDocument();
      expect(screen.getByTestId("expense-name")).toBeInTheDocument();
      expect(screen.getByTestId("datepicker")).toBeInTheDocument();
      expect(screen.getByTestId("amount")).toBeInTheDocument();
      expect(screen.getByTestId("vat")).toBeInTheDocument();
      expect(screen.getByTestId("pct")).toBeInTheDocument();
      expect(screen.getByTestId("commentary")).toBeInTheDocument();
      expect(screen.getByTestId("file")).toBeInTheDocument();
      expect(screen.getByText("Envoyer")).toBeInTheDocument();
    });
  });
});
