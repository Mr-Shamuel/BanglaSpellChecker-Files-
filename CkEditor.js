import "./CkEditor.css";
import JoditEditor from "jodit-react";
import { Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../../../../Services/Interceptor";
import { convertToBanglaNumerals } from "../../../../../../Common/CommonFunctions/ConvertBnToEN";
import { getOverAllPerformancePreview } from "../../../../../../Redux/Actions/Apamanagement/ApaPreparationByUser/OverAllPerformance/OverAllPerformancePreviewAction";
import { BanglaSpellCheckScript } from "../../../../../../Common/CommonFunctions/BanglaSpellCheckScript";
import ConvertBnStringToEnString from "../../../../../../Common/CommonFunctions/ConvertBnStringToEnString";
import CopyOverAllPerform from "./CopyOverAllPerform";

const CkEditor = (props) => {
  const {
    item,
    filteredData,
    selectedItem,
    setShowSubTitle,
    setshowTextEditor,
  } = props;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: "",
    },
  });

  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [wordCount, setWordCount] = useState(0);
  const [overAllPerformaceUpData, setOverAllPerformaceUpData] = useState();

  const [shwoSpellCkr, setshwoSpellCkr] = useState(false);
  const [textData, setTextData] = useState("");
  const [openCopyOverAllPerform, setOpenCopyOverAllPerform] = useState(false);

  //spellchekcer jQuery Script
  useEffect(() => {
    BanglaSpellCheckScript();
  }, []);

  //showgin spell checker
  const handleSpellCheckerViewBtn = () => {
    if (window.BanglaSpeller) {
      window.BanglaSpeller("#input-area");
    }
  };

  const handleUpdatedData = () => {
    const resTitle = document.getElementById("input-area").value;
    setTextData(resTitle);
  };

  const handleEditorChange = (newValue) => {
    setWordCount(getWordCount(newValue));

    // spell checker start
    if (newValue.length === 0) {
      setshwoSpellCkr(false);
    } else if (newValue.length > 1) {
      setshwoSpellCkr(true);
    }
  };

  const getWordCount = (value) => {
    const plainText = value.replace(/<[^>]+>/g, " ");
    const words = plainText.trim().split(/\s+/);
    return words.length;
  };

  useEffect(() => {
    if (item?.maxInput < wordCount) {
      toast.error(t("CommonToast.exceededWord"), {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: false,
        autoClose: 3000,
        theme: "colored",
      });
    }
  }, [item?.maxInput < wordCount]);

  useEffect(() => {
    if (item?.id) {
      axiosInstance
        .post(
          `/apa-config/api/v1/overview-subtitle-user-inputs/subtitle/${item?.id}`,
          filteredData
        )
        .then((res) => {
          setOverAllPerformaceUpData(res?.data?.data);

          if (res?.data?.data?.makerCheckerInputId === 0) {
            setTextData(res?.data?.data?.cabinetInputDescription);
          } else {
            setTextData(res?.data?.data?.makerCheckerInputDescription);
          }
        })
        .catch((err) => {
          console.log(err, "err");
        });
    }
  }, [dispatch, item?.id, filteredData]);

  const onSubmit = (data) => {
    const resTitle = document.getElementById("input-area").value;
    data.description = resTitle;
    setTextData(data.description);

    const editorData = {
      description: data?.description,
      overviewSubtitleId: item?.id,
      fiscalYearId: parseInt(filteredData?.fiscalYearId),
      mandatoryWeightId: parseInt(filteredData?.mandatoryWeightId),
      isHigherOffice: filteredData?.isHigherOffice,
      organizationId: filteredData?.organizationId,
    };

    if (overAllPerformaceUpData?.makerCheckerInputDescription) {
      axiosInstance
        .put(
          `/apa-config/api/v1/overview-subtitle-user-inputs/${overAllPerformaceUpData?.makerCheckerInputId}`,
          editorData
        )
        .then((res) => {
          toast.success(t("CommonToast.update"), {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: false,
            autoClose: 500,
            theme: "colored",
          });
          handleBack();
          // dispatch(getOverAllPerformanceSubtitle(item?.overviewId, filteredData));
          dispatch(
            getOverAllPerformancePreview(selectedItem?.entityId, filteredData)
          );
        })
        .catch((err) => {
          toast.error(err.response.data.message, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: false,
            autoClose: 700,
            theme: "colored",
          });
        });
    } else {
      axiosInstance
        .post(
          "apa-config/api/v1/overview-subtitle-user-inputs/create",
          editorData
        )
        .then((res) => {
          toast.success(t("CommonToast.save"), {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: false,
            autoClose: 500,
            theme: "colored",
          });
          dispatch(
            getOverAllPerformancePreview(selectedItem?.entityId, filteredData)
          );
          handleBack();
        })
        .catch((err) => {
          toast.error(err.response.data.message, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: false,
            autoClose: 700,
            theme: "colored",
          });
        });
    }
  };

  const handleBack = () => {
    setshowTextEditor(false);
    setShowSubTitle(true);
  };

  const copyOverallPerformance = () => {
    setOpenCopyOverAllPerform(true);
  };

  return (
    <div className="ckEditor_con">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Form.Label className="form-label text-dark  mb-3 mt-0  fw-bolder">
          {" "}
          {item?.subTitle}
        </Form.Label>

        <Controller
          name="description"
          control={control}
          rules={{ required: "This field is required." }}
          render={({ field }) => (
            <>
              <JoditEditor
                id="input-area"
                value={textData}
                onChange={(newValue) => {
                  field.onChange(newValue);
                  handleEditorChange(newValue);
                }}
              />
            </>
          )}
        />

        {errors?.description?.type === "required" && (
          <span className="text-danger" style={{ fontSize: "16px" }}>
            {i18n.language === "en" ? " Required" : "এই তথ্যটি আবশ্যক"}
          </span>
        )}

        <div className="div d-flex justify-content-between mx-3 mt-3">
          <div
            style={{
              paddingTop: "2px",
              color: "white",
              fontSize: "12px",
            }}
          >
            {i18n.language === "en" ? (
              <>
                {" "}
                {t("Common.totalWord")}
                {" : "}
                {ConvertBnStringToEnString(item?.maxInput ? item?.maxInput : 0)}
                {", "}
                {t("Common.totalwritten")}
                {" : "}
                {ConvertBnStringToEnString(wordCount)}
                {", "}
                {t("Common.totalwordLeft")}
                {" : "}
                {ConvertBnStringToEnString(item?.maxInput - wordCount)}
              </>
            ) : (
              <>
                {" "}
                {t("Common.totalWord")}
                {" : "}
                {convertToBanglaNumerals(item?.maxInput ? item?.maxInput : 0)}
                {", "}
                {t("Common.totalwritten")}
                {" : "}
                {convertToBanglaNumerals(wordCount)}
                {", "}
                {t("Common.totalwordLeft")}
                {" : "}
                {convertToBanglaNumerals(item?.maxInput - wordCount)}
              </>
            )}
          </div>

          <div className="d-flex gap-1">
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>{t("Common.backStrObj")}</Tooltip>}
            >
              <Button
                variant="none"
                onClick={handleBack}
                className="btn btn-info text-primary"
              >
                <i className="fa fa-undo tx-23"></i>
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>{t("Common.copyOverAllPerform")}</Tooltip>}
            >
              <Button
                variant="none"
                className="btn btn-secondary "
                onClick={copyOverallPerformance}
                disabled={wordCount > item?.maxInput}
              >
                <i className="fa fa-copy tx-23"></i>
              </Button>
            </OverlayTrigger>

            {overAllPerformaceUpData?.makerCheckerInputDescription ? (
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip>{t("Common.addStrObj")}</Tooltip>}
              >
                <Button
                  className={` ${
                    wordCount > item?.maxInput
                      ? "btn btn-light disabled"
                      : "btn btn-success"
                  }`}
                  type="submit"
                  disabled={wordCount > item?.maxInput}
                >
                  <i className="fa fa-save text-light tx-23"></i>
                </Button>
              </OverlayTrigger>
            ) : (
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip>{t("CommonBtn.create")}</Tooltip>}
              >
                <Button
                  className={` ${
                    wordCount > item?.maxInput
                      ? "btn btn-light disabled"
                      : "btn btn-success"
                  }`}
                  type="submit"
                  disabled={wordCount > item?.maxInput}
                >
                  <i className="fa fa-save text-light tx-23"></i>
                </Button>
              </OverlayTrigger>
            )}
          </div>
        </div>

        {shwoSpellCkr && (
          <span className="d-flex gap-2">
            <p
              className="  my-1 tx-10 cursor-pointerSpellChecker text-white"
              onClick={handleSpellCheckerViewBtn}
            >
              <i className="fa fa-check-circle text-success"></i>{" "}
              {t("SpellChecker.check")}
            </p>

            <p
              className="  my-1 tx-10 cursor-pointerSpellChecker text-white"
              onClick={handleUpdatedData}
            >
              <i className="fa fa-check-square text-info"></i>{" "}
              {t("SpellChecker.confirm")}
            </p>
          </span>
        )}
      </form>
      {openCopyOverAllPerform && (
        <CopyOverAllPerform
          openCopyOverAllPerform={openCopyOverAllPerform}
          setOpenCopyOverAllPerform={setOpenCopyOverAllPerform}
          filteredData={filteredData}
          overviewSubtitleId={item}
          selectedItem={selectedItem}
          handleBack={handleBack}
        />
      )}
    </div>
  );
};

export default CkEditor;
