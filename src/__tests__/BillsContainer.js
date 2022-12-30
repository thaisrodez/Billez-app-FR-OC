/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import Bills from "../containers/Bills";
import BillsUI from "../views/BillsUI";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given that I am connected as an employee", () => {
  beforeEach(() => {
    // create a fake localStorage to define user
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    // insert Bills UI in DOM
    document.body.innerHTML = BillsUI({ data: bills });
  });

  describe("When I click on adding a new bill", () => {
    test("Then it should display bill form", () => {
      // initialise Bills page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // initialise store
      const store = null;

      // initialise bills handler
      var billsContainer = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // get new Bill button
      const newBillBtn = screen.getByTestId("btn-new-bill");

      // mock function
      const handleClickNewBill = jest.fn(() =>
        billsContainer.handleClickNewBill()
      );

      // mock click
      newBillBtn.addEventListener("click", handleClickNewBill);
      fireEvent.click(newBillBtn);

      // expect function to have been called and form to be displayed
      expect(handleClickNewBill).toHaveBeenCalled();
      const newFormBill = screen.getByTestId("form-new-bill");
      expect(newFormBill).toBeTruthy();
      // check inputs in UI
    });
  });

  describe("When I click on bill eye Icon", () => {
    test("Then it should display the bill attached document", () => {
      // mock function modal (create a fake function)
      $.fn.modal = jest.fn();

      // initialise page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // initialise store
      const store = null;

      // initialise Bills handler
      var billsContainer = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // find icon to open modal
      const eye = screen.getAllByTestId("icon-eye")[0];

      // mock function
      const handleClickIconEye = jest.fn(() =>
        billsContainer.handleClickIconEye(eye)
      );

      /// mock click on icon
      eye.addEventListener("click", handleClickIconEye);
      userEvent.click(eye);

      // expect function to have been called
      expect(handleClickIconEye).toHaveBeenCalled();

      expect(eye).toHaveAttribute("data-bill-url");

      // expect modal to show
      const modal = screen.getByTestId("modal");
      expect(modal).toBeTruthy();
    });
  });

  describe("When I navigate to Bills", () => {
    test("Then it fetches bills from mock API GET", async () => {
      // initialise DOM
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // initialise Router and navigate to Bills page
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // wait for Bills page to display
      await waitFor(() => screen.getByText("Mes notes de frais"));

      // Bills table should be display
      const billTable = screen.getByTestId("tbody");
      expect(billTable).toBeTruthy();
      // not enough
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");

      // initialise DOM and router
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);

      // expect 404 error message to be display
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);

      // expect 500 error message to be display
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
